import { useEthersAppContext } from 'eth-hooks/context';
import React, { FC } from 'react';

import { ThemeSwitcher } from '~common/components';
import { IScaffoldAppProviders } from '~common/models';

export interface IMainPageFooterProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price: number;
  children?: React.ReactNode;
}

/**
 * 🗺 Footer: Extra UI like gas price, eth price, faucet, and support:
 * @param props
 * @returns
 */
export const MainPageFooter: FC<IMainPageFooterProps> = (props) => {
  const ethersAppContext = useEthersAppContext();

  const left = (
    <div
      style={{
        position: 'fixed',
        textAlign: 'left',
        left: 0,
        bottom: 20,
        padding: 10,
      }}>
      Licensed under MIT License - Copyright (C) cybertelx 2022.
    </div>
  );

  const right = <ThemeSwitcher />;

  return (
    <>
      {left}
      {right}
    </>
  );
};
