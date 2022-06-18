/* eslint-disable unused-imports/no-unused-vars-ts */
import '~~/styles/main-page.css';
import { Card, Col, Divider, Row, Typography, Button } from 'antd';
import { Faucet } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import {
  useContractReader,
  useBalance,
  useEthersAdaptorFromProviderOrSigners,
  useSignerAddress,
  useGasPrice,
} from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { ethers } from 'ethers';
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import { MainPageFooter, MainPageHeader, createTabsAndRoutes, TContractPageList } from '../components/main';

import LyicxImage from '~assets/lyicx.png';
import { getFaucetAvailable } from '~common/components';
import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~common/components/context';
import { useCreateAntNotificationHolder } from '~common/components/hooks/useAntNotification';
import { useBurnerFallback } from '~common/components/hooks/useBurnerFallback';
import { useScaffoldAppProviders } from '~common/components/hooks/useScaffoldAppProviders';
import { getNetworkInfo } from '~common/functions';
import { useLyicxComment } from '~~/components/hooks/useLyicxComment';
import { useScaffoldHooksExamples } from '~~/components/hooks/useScaffoldHooksExamples';
import {
  BURNER_FALLBACK_ENABLED,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  FAUCET_ENABLED,
  INFURA_ID,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config';

/** ********************************
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See ./config/app.config.ts for configuration, such as TARGET_NETWORK
 * See ../common/src/config/appContracts.config.ts and ../common/src/config/externalContracts.config.ts to configure your contracts
 * See pageList variable below to configure your pages
 * See ../common/src/config/web3Modal.config.ts to configure the web3 modal
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ******************************** */

/**
 * The main component
 * @returns
 */
export const MainPage: FC = () => {
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);

  const notificationHolder = useCreateAntNotificationHolder();
  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetwork: TARGET_NETWORK_INFO,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    infuraId: INFURA_ID,
  });

  // 🦊 Get your web3 ethers context from current providers
  const ethersAppContext = useEthersAppContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersAppContext));

  // -----------------------------
  // Hooks use and examples
  // -----------------------------
  // 🎉 Console logs & More hook examples:
  // 🚦 disable this hook to stop console logs
  // 🏹🏹🏹 go here to see how to use hooks!
  useScaffoldHooksExamples(scaffoldAppProviders);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(TARGET_NETWORK_INFO.chainId, 'fast');

  // The transactor wraps transactions and provides notificiations
  const tx = transactor(ethComponentsSettings, ethersAppContext?.signer, gasPrice[0]);

  // -----------------------------
  // These are the contracts!
  // -----------------------------

  // init contracts
  const lyicxCoin = useAppContracts('LyicxCoin', ethersAppContext.chainId);

  const sink = useAppContracts('Sink', ethersAppContext.chainId);

  const [myAddress] = useSignerAddress(ethersAppContext.signer);
  const lycxBalanceResult = useContractReader(lyicxCoin, lyicxCoin?.balanceOf, [myAddress ?? '']);
  const totalSupplyResult = useContractReader(lyicxCoin, lyicxCoin?.totalSupply, []);

  const lycxBalance = useMemo(
    () => ethers.utils.formatEther(lycxBalanceResult[0] !== undefined ? lycxBalanceResult[0] : 0),
    [lycxBalanceResult]
  );
  const totalSupply = useMemo(
    () => ethers.utils.formatEther(totalSupplyResult[0] !== undefined ? totalSupplyResult[0] : 0),
    [totalSupplyResult]
  );

  const percentageOfTotalSupply =
    Number(lycxBalance) !== 0 && Number(totalSupply) !== 0 ? (Number(lycxBalance) / Number(totalSupply)) * 100 : 0;
  const lyicxComment = useLyicxComment(Number(lycxBalance));

  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------
  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const [ethPrice] = useDexEthPrice(
    scaffoldAppProviders.mainnetAdaptor?.provider,
    ethersAppContext.chainId !== 1 ? scaffoldAppProviders.targetNetwork : undefined
  );

  // 💰 this hook will get your balance
  const [yourCurrentBalance] = useBalance(ethersAppContext.account);

  const [route, setRoute] = useState<string>('');
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  // Faucet Tx can be used to send funds from the faucet
  const faucetAvailable = getFaucetAvailable(scaffoldAppProviders, ethersAppContext, FAUCET_ENABLED);

  const network = getNetworkInfo(ethersAppContext.chainId);

  // -----------------------------
  // 📃 App Page List
  // -----------------------------
  // This is the list of tabs and their contents
  const pageList: TContractPageList = {
    mainPage: {
      name: 'Dashboard',
      content: (
        <>
          {/* <GenericContract
            contractName="LyicxCoin"
            contract={lyicxCoin}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />*/}
          <Row wrap={false} justify="space-evenly">
            {/* <GenericContract
            contractName="LyicxCoin"
            contract={lyicxCoin}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />*/}
            <Col flex="500px">
              <Card title={<Typography.Title>Lyicx Coin</Typography.Title>}>
                <Typography.Title level={3}>
                  A revolutionary new cryptocurrency powered by Lyicxonomics™.
                </Typography.Title>
                <Typography.Paragraph>
                  <blockquote>what the fuck is a lyicxonomic</blockquote>
                  <figcaption>
                    —Lyicx, <cite>#freedom-01-server-chat</cite>
                  </figcaption>
                </Typography.Paragraph>
                <Row>
                  <Col flex="auto">
                    <img src={LyicxImage} width="200px"></img>
                  </Col>
                  <Col flex="auto">
                    {ethersAppContext.chainId !== TARGET_NETWORK_INFO.chainId && (
                      <>
                        <Typography.Title level={5}>
                          Please connect your wallet with the correct blockchain to continue.
                        </Typography.Title>
                      </>
                    )}
                    {ethersAppContext.chainId === TARGET_NETWORK_INFO.chainId && (
                      <>
                        <Typography>Total Supply</Typography>
                        <h2>
                          <b>{totalSupply} LYCX</b>
                        </h2>
                        <Divider />
                        <Typography>Your Balance</Typography>
                        <h2>
                          <b>{lycxBalance} LYCX</b>
                        </h2>
                        {lyicxComment}
                        <Divider />
                        <Typography>Percentage of Total Supply</Typography>
                        <h2>
                          <b>{Math.round(percentageOfTotalSupply * 100) / 100}%</b>
                        </h2>
                      </>
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    pages: [
      {
        name: 'Sink',
        content: (
          <Row wrap={false} justify="space-evenly">
            {/* <GenericContract
            contractName="LyicxCoin"
            contract={lyicxCoin}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />*/}
            <Col flex="500px">
              <Card title={<Typography.Title>Sink</Typography.Title>}>
                <Typography.Title level={3}>Press button for 1000 free LYCX coins</Typography.Title>
                <Typography.Paragraph>
                  <blockquote>what the fuck is a lyicxonomic</blockquote>
                  <figcaption>
                    —Lyicx, <cite>#freedom-01-server-chat</cite>
                  </figcaption>
                </Typography.Paragraph>

                <Button
                  onClick={(): void => {
                    if (tx && sink && sink.drip) void tx(sink?.drip());
                  }}>
                  Get 1000 free LYCX!!!
                </Button>
                <Row>
                  <Col flex="auto">
                    <img src={LyicxImage} width="200px"></img>
                  </Col>
                </Row>
                {
                  /*  if the local provider has a signer, let's show the faucet:  */
                  faucetAvailable && scaffoldAppProviders?.mainnetAdaptor && scaffoldAppProviders?.localAdaptor ? (
                    <Faucet
                      localAdaptor={scaffoldAppProviders.localAdaptor}
                      price={0}
                      mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
                    />
                  ) : (
                    <></>
                  )
                }
              </Card>
            </Col>
          </Row>
        ),
      },
      {
        name: 'About and Help',
        content: (
          <Row wrap={false} justify="space-evenly">
            {/* <GenericContract
            contractName="LyicxCoin"
            contract={lyicxCoin}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />*/}
            <Col flex="500px">
              <Card title={<Typography.Title>Alright, really</Typography.Title>}>
                <Typography.Title level={3}>Lyicx Coin is a joke coin haha</Typography.Title>
                <Typography.Paragraph>
                  <blockquote>what the fuck is a lyicxonomic</blockquote>
                  <figcaption>
                    —Lyicx, <cite>#freedom-01-server-chat</cite>
                  </figcaption>
                </Typography.Paragraph>
                <Typography.Paragraph>
                  The coin is on the Gnosis Chain. This is not financial advice. Nothing here is financial advice. Lyicx
                  has authorized this coin.
                </Typography.Paragraph>
                <Typography.Paragraph>
                  What do you use Lyicx Coin for? Well of course, you can tip your friends some LYCX as a joke.
                  That&apos;s it. Seriously.
                </Typography.Paragraph>
                <ul>
                  <li>
                    <Typography.Link href="https://xdai-faucet.top/">Get free xDAI for transactions</Typography.Link>
                  </li>
                  <li>
                    <Typography.Link href="https://metamask.zendesk.com/hc/en-us/articles/360052711572-How-to-connect-to-the-Gnosis-Chain-network-formerly-xDai-">
                      How to add the Gnosis Chain to MetaMask
                    </Typography.Link>
                  </li>
                  <li>
                    <Typography.Link href="https://github.com/cybertelx">
                      Here&apos;s a link to my awesome GitHub!
                    </Typography.Link>
                  </li>
                  <li>
                    <Typography.Link href="https://youtube.com/Lyicx">
                      Also a link to Lyicx&apos;s YouTube channel.
                    </Typography.Link>
                  </li>
                </ul>
                - Made with ❤️ by Operator (the dope)
              </Card>
            </Col>
          </Row>
        ),
      },
    ],
  };
  const { routeContent: tabContents, tabMenu } = createTabsAndRoutes(pageList, route, setRoute);

  // -----------------------------
  // 📃 Render the react components
  // -----------------------------

  return (
    <div className="App">
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
      {/* Routes should be added between the <Switch> </Switch> as seen below */}
      <BrowserRouter>
        {tabMenu}
        <Switch>
          {tabContents}
          {/* Subgraph also disabled in MainPageMenu, it does not work, see github issue https://github.com/scaffold-eth/scaffold-eth-typescript/issues/48! */}
          {/*
          <Route path="/subgraph">
            <Subgraph subgraphUri={subgraphUri} mainnetProvider={scaffoldAppProviders.mainnetAdaptor?.provider} />
          </Route>
          */}
        </Switch>
      </BrowserRouter>

      <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
      <div style={{ position: 'absolute' }}>{notificationHolder}</div>
    </div>
  );
};
