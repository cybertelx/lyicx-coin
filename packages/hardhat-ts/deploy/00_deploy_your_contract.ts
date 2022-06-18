import { utils } from 'ethers';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const lyicx = '0x3e86ab8925af073e1f1b3780d9cb77550ee19a6e';

  const lyicxCoin = await deploy('LyicxCoin', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: ["Hello"],
    log: true,
  });

  const sink = await deploy('Sink', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [lyicxCoin.address],
    log: true,
  });
  await execute('LyicxCoin', { from: deployer, log: true }, 'adminMint', lyicx, utils.parseEther('6900000'));
  await execute('LyicxCoin', { from: deployer, log: true }, 'adminMint', deployer, utils.parseEther('4200696'));
  await execute('LyicxCoin', { from: deployer, log: true }, 'adminMint', sink.address, utils.parseEther('58320000'));
};
export default func;
func.tags = ['LyicxCoin'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
