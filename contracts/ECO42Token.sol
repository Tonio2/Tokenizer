// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract ECO42Token is ERC20 {
    constructor() ERC20("ECO42Token", "E42") {}

    struct Project {
        string name;
        address payable recipient;
        uint256 amountNeeded;
        uint256 amountRaised;
        bool funded;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount = 0;
    mapping(address => mapping(uint256 => uint256)) public funds; // Store how many each funder has given to each project

    function createProject(string memory _name, uint256 _amountNeeded) public {
        require(_amountNeeded > 0, "Amount needed should be greater than 0");
        require(bytes(_name).length > 0, "Name should not be empty");
        projects[projectCount] = Project({
            name: _name,
            recipient: payable(msg.sender),
            amountNeeded: _amountNeeded,
            amountRaised: 0,
            funded: false
        });
        projectCount++;
    }

    function fundProject(uint256 _id, uint256 _amount) public payable {
        Project storage project = projects[_id];

        require(project.recipient != address(0), "Project does not exist");
        require(!project.funded, "Project already funded");

        uint256 fund = funds[msg.sender][_id];
        if (_amount > fund) {
            uint256 diff = _amount - funds[msg.sender][_id];
            require(
                project.amountRaised + diff <= project.amountNeeded,
                "Project already funded"
            );
            require(msg.value == diff, "The difference mut be paid");
            _mint(msg.sender, diff);
            project.amountRaised += diff;
            funds[msg.sender][_id] = _amount;
        } else {
            uint256 diff = fund - _amount;
            _burn(msg.sender, diff);
            project.amountRaised -= diff;
            funds[msg.sender][_id] = _amount;
            (bool sent, ) = msg.sender.call{value: diff}("");
            require(sent, "Failed to send Ether");
        }

        if (project.amountRaised == project.amountNeeded) {
            project.funded = true;
            project.recipient.transfer(project.amountNeeded);
        }
    }
}
