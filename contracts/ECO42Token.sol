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

    function fundProject(uint256 _id) public payable {
        Project storage project = projects[_id];
        uint256 _amount = msg.value;

        require(project.recipient != address(0), "Project does not exist");
        require(!project.funded, "Project already funded");
        require(
            project.amountRaised + _amount <= project.amountNeeded,
            "Project already funded"
        );
        require(_amount > 0, "Amount cannot be zero");

        _mint(msg.sender, _amount);
        project.amountRaised += _amount;

        if (project.amountRaised == project.amountNeeded) {
            project.funded = true;
            project.recipient.transfer(project.amountNeeded);
        }
    }
}
