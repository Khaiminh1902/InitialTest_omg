async function main() {
  let hardhat;

  try {
    hardhat = require('hardhat');
  } catch (error) {
    console.error(
      'Hardhat is not installed in this repository. Install it before running contract deployment.'
    );
    console.error('Suggested next step: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox');
    process.exitCode = 1;
    return;
  }

  const { ethers } = hardhat;
  const initialSupply = Number.parseInt(process.env.TOKEN_INITIAL_SUPPLY || '1000000', 10);

  if (!Number.isFinite(initialSupply) || initialSupply <= 0) {
    throw new Error('TOKEN_INITIAL_SUPPLY must be a positive integer.');
  }

  const AssessmentToken = await ethers.getContractFactory('AssessmentToken');
  const token = await AssessmentToken.deploy(initialSupply);
  await token.waitForDeployment();

  console.log('AssessmentToken deployed to:', await token.getAddress());
  console.log('Initial supply:', initialSupply);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
