import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const amountNeeded = ethers.parseUnits("0.1");
const amountFunded = ethers.parseUnits("0.05");
const smallAmount = ethers.parseUnits("0.001");

describe("ECO42Token", function () {
  async function deployECO42TokenFixture() {
    const [owner, projectDev, funder, otherAccount] = await ethers.getSigners();
    const ECO42Token = await ethers.getContractFactory("ECO42Token");
    const eco42Token = await ECO42Token.deploy();

    await eco42Token
      .connect(projectDev)
      .createProject("Project 1", amountNeeded);

    return { eco42Token, owner, projectDev, funder, otherAccount };
  }

  describe("Deployment", function () {
    it("Should have the right total supply", async function () {
      const { eco42Token } = await loadFixture(deployECO42TokenFixture);

      expect(await eco42Token["totalSupply()"]()).to.equal(0);
    });
  });

  describe("Project", function () {
    it("Should add a project", async function () {
      const { eco42Token, projectDev } = await loadFixture(
        deployECO42TokenFixture
      );

      expect(await eco42Token.projects(0)).to.deep.equal([
        "Project 1",
        projectDev.address,
        amountNeeded,
        false,
      ]);
      expect(await eco42Token.projectCount()).to.equal(1);
    });

    it("Should fail if the project name is empty", async function () {
      const { eco42Token, projectDev } = await loadFixture(
        deployECO42TokenFixture
      );

      await expect(
        eco42Token.connect(projectDev).createProject("", amountNeeded)
      ).to.be.revertedWith("Name should not be empty");
    });

    it("Should fail if the amount needed for the project is zero", async function () {
      const { eco42Token, projectDev } = await loadFixture(
        deployECO42TokenFixture
      );

      await expect(
        eco42Token.connect(projectDev).createProject("Project 2", 0)
      ).to.be.revertedWith("Amount needed should be greater than 0");
    });
  });

  describe("Funding", function () {
    it("Should fund a project", async function () {
      const { eco42Token, funder } = await loadFixture(deployECO42TokenFixture);

      await eco42Token
        .connect(funder)
        .fundProject(0, amountFunded, { value: amountFunded });
      expect(await eco42Token["totalSupply(uint256)"](0)).to.equal(
        amountFunded
      );
    });

    it("Should fail if the project does not exist", async function () {
      const { eco42Token, funder } = await loadFixture(deployECO42TokenFixture);

      await expect(
        eco42Token
          .connect(funder)
          .fundProject(1, amountFunded, { value: amountFunded })
      ).to.be.revertedWith("Project does not exist");
    });

    it("Should mint and transfer token to the funder", async function () {
      const { eco42Token, funder } = await loadFixture(deployECO42TokenFixture);

      await eco42Token
        .connect(funder)
        .fundProject(0, amountFunded, { value: amountFunded });
      expect(await eco42Token.balanceOf(funder.address, 0)).to.equal(
        amountFunded
      );
    });

    it("Should fail if the project is already funded", async function () {
      const { eco42Token } = await loadFixture(deployECO42TokenFixture);

      await eco42Token.fundProject(0, amountNeeded, { value: amountNeeded });
      await expect(
        eco42Token.fundProject(0, amountNeeded, { value: amountNeeded })
      ).to.be.revertedWith("Project already funded");
    });

    it("Should fail if the amount is more than the needed amount", async function () {
      const { eco42Token } = await loadFixture(deployECO42TokenFixture);

      await expect(
        eco42Token.fundProject(0, ethers.parseUnits("0.501"), {
          value: ethers.parseUnits("0.501"),
        })
      ).to.be.revertedWith("Cannot exceed the amount needed");
    });

    it("Should transfer amount / 1000 ether to the contract from the funder", async function () {
      const { eco42Token, funder } = await loadFixture(deployECO42TokenFixture);

      await expect(
        eco42Token
          .connect(funder)
          .fundProject(0, amountFunded, { value: amountFunded })
      ).to.changeEtherBalances(
        [funder, eco42Token],
        [-amountFunded, amountFunded]
      );
    });

    it("Should pay the project dev if the full amount is funded", async function () {
      const { eco42Token, projectDev, funder } = await loadFixture(
        deployECO42TokenFixture
      );

      await expect(
        eco42Token
          .connect(funder)
          .fundProject(0, amountNeeded, { value: amountNeeded })
      ).to.changeEtherBalances(
        [funder, projectDev],
        [-amountNeeded, amountNeeded]
      );
    });

    it("Should pay the project dev when the full amount is funded", async function () {
      const { eco42Token, projectDev, funder } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(funder)
        .fundProject(0, amountFunded, { value: amountFunded });
      await expect(
        eco42Token
          .connect(funder)
          .fundProject(0, amountNeeded, { value: amountFunded })
      ).to.changeEtherBalances(
        [eco42Token, projectDev],
        [-amountFunded, amountNeeded]
      );
    });

    it("Should reimburse the funder if amount is lower than funded", async function () {
      const { eco42Token, funder } = await loadFixture(deployECO42TokenFixture);

      const diff = amountFunded - smallAmount;

      await eco42Token
        .connect(funder)
        .fundProject(0, amountFunded, { value: amountFunded });
      await expect(
        eco42Token.connect(funder).fundProject(0, smallAmount)
      ).to.changeEtherBalances([eco42Token, funder], [-diff, diff]);
      expect(await eco42Token.balanceOf(funder, 0)).to.equal(smallAmount);
    });

    it("Defund should suceeed even if token have been transfered", async function () {
      const { eco42Token, funder, otherAccount } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(funder)
        .fundProject(0, amountFunded, { value: amountFunded });
      await eco42Token
        .connect(funder)
        .safeTransferFrom(
          funder.address,
          otherAccount.address,
          0,
          amountFunded,
          "0x"
        );
      expect(await eco42Token.balanceOf(otherAccount.address, 0)).to.equal(
        amountFunded
      );
      await eco42Token.connect(otherAccount).fundProject(0, 0);
      expect(await eco42Token.balanceOf(otherAccount.address, 0)).to.equal(0);
      expect(await eco42Token["totalSupply(uint256)"](0)).to.equal(0);
    });

    it("Should not remove fundings if token have been transfered", async function () {
      const { eco42Token, funder, otherAccount } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(funder)
        .fundProject(0, amountFunded, { value: amountFunded });
      await eco42Token
        .connect(funder)
        .safeTransferFrom(
          funder.address,
          otherAccount.address,
          0,
          amountFunded,
          "0x"
        );
      expect(await eco42Token.balanceOf(otherAccount.address, 0)).to.equal(
        amountFunded
      );
      await eco42Token.connect(funder).fundProject(0, 0);
      expect(await eco42Token["totalSupply(uint256)"](0)).to.equal(
        amountFunded
      );
    });
  });
});
