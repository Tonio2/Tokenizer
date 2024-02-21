import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const amountNeeded = ethers.parseUnits("0.1");
const amountFunded = ethers.parseUnits("0.05");

describe("ECO42Token", function () {
  async function deployECO42TokenFixture() {
    const [owner, projectDev, funder] = await ethers.getSigners();
    const ECO42Token = await ethers.getContractFactory("ECO42Token");
    const eco42Token = await ECO42Token.deploy();

    return { eco42Token, owner, projectDev, funder };
  }

  describe("Deployment", function () {
    it("Should have the right name", async function () {
      const { eco42Token } = await loadFixture(deployECO42TokenFixture);

      expect(await eco42Token.name()).to.equal("ECO42Token");
    });

    it("Should have the right symbol", async function () {
      const { eco42Token } = await loadFixture(deployECO42TokenFixture);

      expect(await eco42Token.symbol()).to.equal("E42");
    });

    it("Should have the right decimals", async function () {
      const { eco42Token } = await loadFixture(deployECO42TokenFixture);

      expect(await eco42Token.decimals()).to.equal(18);
    });

    it("Should have the right total supply", async function () {
      const { eco42Token } = await loadFixture(deployECO42TokenFixture);

      expect(await eco42Token.totalSupply()).to.equal(0);
    });
  });

  describe("Project", function () {
    it("Should add a project", async function () {
      const { eco42Token, projectDev } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      expect(await eco42Token.projects(0)).to.deep.equal([
        "Project 1",
        projectDev.address,
        amountNeeded,
        0,
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
        eco42Token.connect(projectDev).createProject("Project 1", 0)
      ).to.be.revertedWith("Amount needed should be greater than 0");
    });
  });

  describe("Funding", function () {
    it("Should fund a project", async function () {
      const { eco42Token, owner, projectDev, funder } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await eco42Token.connect(funder).fundProject(0, { value: amountFunded });
      expect((await eco42Token.projects(0))[3]).to.equal(amountFunded);
    });

    it("Should fail if the project does not exist", async function () {
      const { eco42Token, funder } = await loadFixture(deployECO42TokenFixture);

      await expect(
        eco42Token.connect(funder).fundProject(0, { value: amountFunded })
      ).to.be.revertedWith("Project does not exist");
    });

    it("Should fail if the amount is zero", async function () {
      const { eco42Token, projectDev, funder } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await expect(
        eco42Token.connect(funder).fundProject(0, { value: 0 })
      ).to.be.revertedWith("Amount cannot be zero");
    });

    it("Should mint and transfer token to the funder", async function () {
      const { eco42Token, projectDev, funder } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await eco42Token.connect(funder).fundProject(0, { value: amountFunded });
      expect(await eco42Token.balanceOf(funder.address)).to.equal(amountFunded);
    });

    it("Should fail if the project is already funded", async function () {
      const { eco42Token, projectDev } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await eco42Token.fundProject(0, { value: amountNeeded });
      await expect(
        eco42Token.fundProject(0, { value: amountNeeded })
      ).to.be.revertedWith("Project already funded");
    });

    it("Should fail if the amount is more than the needed amount", async function () {
      const { eco42Token, projectDev } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await expect(
        eco42Token.fundProject(0, { value: ethers.parseUnits("0.501") })
      ).to.be.revertedWith("Project already funded");
    });

    it("Should transfer amount / 1000 ether to the contract from the funder", async function () {
      const { eco42Token, projectDev, funder } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await expect(
        eco42Token.connect(funder).fundProject(0, { value: amountFunded })
      ).to.changeEtherBalances(
        [funder, eco42Token],
        [-amountFunded, amountFunded]
      );
    });

    it("Should pay the project dev if the full amount is funded", async function () {
      const { eco42Token, projectDev, funder } = await loadFixture(
        deployECO42TokenFixture
      );

      await eco42Token
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await expect(
        eco42Token.connect(funder).fundProject(0, { value: amountNeeded })
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
        .connect(projectDev)
        .createProject("Project 1", amountNeeded);
      await eco42Token.connect(funder).fundProject(0, { value: amountFunded });
      await expect(
        eco42Token.connect(funder).fundProject(0, { value: amountFunded })
      ).to.changeEtherBalances(
        [eco42Token, projectDev],
        [-amountFunded, amountNeeded]
      );
    });
  });
});
