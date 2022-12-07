import { Contract, DeployOptions, SendOptions, ContractSendMethod } from 'web3-eth-contract';
import Web3 from 'web3'

export interface IContractOptions {
    contractAddress: string
}

export interface IContractDeploymentOptions {
    contractAbi: string
    contractByteCode: string
    owner: string
}

export interface IUniversityContract {
    deployContract( deploymentOptions: IContractDeploymentOptions ): Contract | undefined
    assertDeploy(): Promise<boolean>
}

export interface IUniversityContractMethods {

    getOwner(): Promise<string>
    getFees?( courseName: string ): Promise<number>
    addCourse?( courseName: string, fees: number ): Promise<boolean>
}

export interface IUniversityContractsWrapperMethods {
    getOwner(): ContractSendMethod
    getFees( courseName: string ): ContractSendMethod
    addCourse( courseName: string, fees: number ): ContractSendMethod
}

export interface IUniversityContractsWrapper extends Contract {
    methods: IUniversityContractsWrapperMethods
}

export class University implements IUniversityContract, IUniversityContractMethods {

    private provider: Web3
    private contractOptions: IContractDeploymentOptions | undefined
    private deployedContract: Contract | undefined
    private contractAddress: string | undefined

    constructor( provider: Web3, contractAddress?: IContractOptions, deploymentOptions?: IContractDeploymentOptions ) {
        this.provider = provider
        this.deployedContract = undefined

        if ( contractAddress != undefined ) {
            this.contractAddress = contractAddress.contractAddress
            this.contractOptions = deploymentOptions
            this.assignContract( contractAddress.contractAddress )
        } else {
            this.contractOptions = deploymentOptions
        }

    }
    
    private assignContract( contractAddress: string ) {
        this.deployedContract = new this.provider.eth
        .Contract(
            JSON.parse( (this.contractOptions as IContractDeploymentOptions).contractAbi ), 
            contractAddress
        );
    }

    deployContract(): Contract | undefined {

        let {
            contractAbi,
            contractByteCode,
            owner
        } = this.contractOptions as IContractDeploymentOptions


        let deployableContract = new this.provider.eth.Contract( JSON.parse( contractAbi ) )
        let payload = { data: contractByteCode } as DeployOptions
        let parameter = {
            from: owner,
            gas: 800000,
            gasPrice: this.provider.utils.toHex(this.provider.utils.toWei('30', 'gwei'))
        } as SendOptions

        deployableContract.deploy( payload )
            .send( parameter, ( err, txHash ) => {
                console.log( txHash )
            })
            .on( 'confirmation', () => {} )
            .then( (newContract) => {
                console.log('Deployed Contract Address : ', newContract.options.address)

                this.deployedContract = newContract
            })

        return this.deployedContract

    }

    assertDeploy(): Promise<boolean> {
        return new Promise<boolean>( 
            ( resolve, reject ) => {
                if ( this.deployedContract != undefined )
                    resolve( true )

                this.deployedContract = new this.provider.eth
                        .Contract(
                            JSON.parse( (this.contractOptions as IContractDeploymentOptions).contractAbi ), 
                            this.contractAddress
                        );

                reject( false )
            }
        )
    }


    /**
     *  Business logic. 
     */

     getOwner(): Promise<string> {
        return new Promise<string>(
            ( resolve, reject ) => {
                if ( this.deployedContract == undefined ) {
                    throw `Reference to deployedContract not defined.`
                }

                let contract = this.deployedContract as IUniversityContractsWrapper

                contract.methods.getOwner().call()
                .then( (val: string) => {
                    resolve(val)
                })
                .catch( (err) => {
                    reject(err)
                })


            }
        )
    }


    getFees( courseName: string): Promise<number> {
        return new Promise<number>( ( resolve, reject ) => {
            this.assertDeploy()

            let contract = this.deployedContract as IUniversityContractsWrapper
            
            contract.methods.getFees( courseName ).call()
            .then( resolve )
            .catch( reject )

        })

    }

    addCourse( courseName: string, fees: number): Promise<boolean> {
        return new Promise<boolean>( ( resolve, reject ) => {
            this.assertDeploy()

            let contract = this.deployedContract as IUniversityContractsWrapper

            contract.methods
            .addCourse( courseName, fees )
            .send( { from: ( this.contractOptions as IContractDeploymentOptions).owner } )
            .then( ( val ) => {
                resolve( true )
            } )
            .catch( reject )

            return true
        })

    }



}