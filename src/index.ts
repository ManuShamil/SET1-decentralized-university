import Web3 from 'web3'
import fs from 'fs'
import { IContractDeploymentOptions, University } from './university';

const contractName = `University`
const contractAbiPath = `./bin/contracts/${contractName}.abi`
const contractByteCodePath = `./bin/contracts/${contractName}.bin`

const contractAbi = fs.readFileSync( contractAbiPath ).toString('utf-8')
const contractByteCode = fs.readFileSync( contractByteCodePath ).toString('utf-8')
const contractOwner = `0xB4e9FE0f8D93628365C75a2B182f31300ebE5942`

const contractAddress = `0x85be03cceD7709a4D6b101bc559240E9AB07Bc4d`


const HttpProvider = `http://127.0.0.1:7545`


let web3: Web3

const assertConnection: () => Promise<Web3> = () => {
    return new Promise<Web3>(( resolve, reject ) => {
        try {
            web3 = new Web3(  new Web3.providers.HttpProvider( HttpProvider  )  )
            console.log(`Connection asserted.`)
            resolve( web3 )
        } catch ( err ) {
            console.log( err )

            reject(false)
        }
    })
}


const deploy: () => void = async () => {
    console.log(`Deploying contract under university.`)
    await assertConnection()

    let contractOptions = {
        contractAbi,
        contractByteCode,
        owner: contractOwner
    } as IContractDeploymentOptions

    // let myUniversity = new University( web3, undefined, contractOptions)
    // let deployedContract = myUniversity.deployContract()
    
    let myUniversity = new University( web3, { contractAddress }, contractOptions )

    let owner = await myUniversity.getOwner()
    let result = await myUniversity.addCourse( `MSc. Computer Science`, 90000)

    let fees = [
        await myUniversity.getFees(`MSc. Computer Science` ),
        await myUniversity.getFees(`MCA`)
    ]

    console.log({
        owner,
        result,
        fees
    })


}

const interact: () => void = async () => {
    await assertConnection()
}



/**
 * Entry point
 */

const startupParams = process.argv

if ( startupParams.length <= 2 ) {
    console.log(`Choose one of the parameters
                deploy : Deploys contract to the block chain.
                interact : Runs all simulations`)
    process.exit(0)
}

let action = startupParams[2]

if ( action == `deploy` )
    deploy()
else if ( action == 'interact' )
    interact()
