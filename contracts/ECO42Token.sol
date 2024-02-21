// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "hardhat/console.sol";

contract ECO42Token is ERC1155, ERC1155Supply {
    constructor() ERC1155("") {}

    struct Project {
        string name;
        address payable recipient;
        uint256 amountNeeded;
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
            funded: false
        });
        projectCount++;
    }

    function fundProject(uint256 _id, uint256 _amount) public payable {
        Project storage project = projects[_id];

        require(_id < projectCount, "Project does not exist");
        require(!project.funded, "Project already funded");

        uint256 fund = balanceOf(msg.sender, _id);
        if (_amount > fund) {
            uint256 diff = _amount - fund;
            require(
                totalSupply(_id) + diff <= project.amountNeeded,
                "Cannot exceed the amount needed"
            );
            require(msg.value >= diff, "Not enough funds to cover the amount needed");
            _mint(msg.sender, _id, diff, "");
        } else {
            uint256 diff = fund - _amount;
            _burn(msg.sender, _id, diff);
            (bool sent, ) = msg.sender.call{value: diff}("");
            require(sent, "Failed to send Ether");
        }

        if (totalSupply(_id) == project.amountNeeded) {
            project.funded = true;
            (bool sent, ) = project.recipient.call{value: project.amountNeeded}("");
            require(sent, "Failed to send Ether");
        }
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
