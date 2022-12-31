// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract University {
    address private contractOwner;

    struct Course {
        string courseName;
        uint64 fees;
    }

    Course[] universityCourses;

    constructor() {
        contractOwner = msg.sender;
    }

    function getFees( string memory courseName ) public view returns( uint64 ) {
        int64 courseIndex = indexOfCouse(courseName);

        if ( courseIndex >= 0)
            return universityCourses[ uint64(courseIndex) ].fees;

        return 0;
    }

    function getOwner() public view returns( address ) {
        return contractOwner;
    }

    function indexOfCouse( string memory courseName ) private view returns ( int64 ) {
        for ( uint64 i=0; i<universityCourses.length; i++ )
            if ( keccak256( abi.encodePacked( universityCourses[i].courseName) ) == keccak256(abi.encodePacked( courseName )) )
                return int64(i);
        return -1;
    }

    function addCourse( string memory courseName, uint64 fees ) public returns (bool) {
        if ( msg.sender != getOwner() ) return false;

        int64 courseIndex = indexOfCouse(courseName);

        //! if already exists, do update only.
        if ( courseIndex >= 0 ) {
            universityCourses[uint64(courseIndex)].fees = fees;
            return true;
        }

        universityCourses.push(Course( courseName, fees ) );

        return true;
    }

}