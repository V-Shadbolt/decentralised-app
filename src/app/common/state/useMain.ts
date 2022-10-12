import {
  getBoosterFarmInterest,
  getInterest,
  getSupportedTokensAdvancedInfo,
  getSupportedTokensBasicInfo,
  getSupportedTokensList,
  getTotalAssets,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getUserDepositedLPAmount
} from 'app/common/functions/web3Client';
import { walletAccount } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useRecoilState } from 'recoil';
import { EChain } from '../constants/chains';
import { toExactFixed } from '../functions/utils';
import { TFarm } from '../types/farm';
import { TAssetsInfo } from '../types/heading';
import { initialAvailableFarmsState } from './farm/useFarm';
import { useNotification } from './useNotification';

export const useMain = () => {
  const [cookies] = useCookies(['has_seen_boost_farms']);
  const { resetNotification } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const [availableFarms, setAvailableFarms] = useState<TFarm[]>(
    initialAvailableFarmsState,
  );
  const [networkFilter, setNetworkFilter] = useState<string>();
  const [tokenFilter, setTokenFilter] = useState<string>();
  const [viewType, setViewType] = useState<string>(null);
  const [sortField, setSortField] = useState<string>(null);
  const [sortDirectionIsAsc, setSortDirectionIsAsc] = useState<boolean>(null);
  const [allSupportedTokens, setAllSupportedTokens] = useState<string[]>([]);

  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    resetNotification();
  }, []);

  useEffect(() => {
    fetchFarmsInfo();
  }, [walletAccountAtom]);

  const fetchFarmsInfo = async () => {
    setIsLoading(true);
    try {
      let numberOfAssets = 0;
      let chainsWithAssets = new Set();
      let allSupportedTokens = new Set<string>();

      await Promise.all(
        initialAvailableFarmsState
          .filter(x => true)
          .map(async availableFarm => {
            const {
              interest,
              totalAssetSupply,
              supportedTokens,
              depositedAmount,
              poolShare,
            } = availableFarm.isBooster
              ? await fetchBoosterFarmInfo(availableFarm)
              : await fetchFarmInfo(availableFarm);

            supportedTokens.map(async supportedToken => {
              allSupportedTokens.add(supportedToken.symbol);
            });

            if (walletAccountAtom) {
              supportedTokens.map(async supportedToken => {
                const advancedSupportedTokenInfo =
                  await getSupportedTokensAdvancedInfo(
                    availableFarm.farmAddress,
                    supportedToken,
                    availableFarm.chain,
                  );
                if (Number(advancedSupportedTokenInfo.balance) > 0) {
                  numberOfAssets++;
                  chainsWithAssets.add(availableFarm.chain);
                }
              });
            }

            availableFarm.interest = interest;
            availableFarm.totalAssetSupply = totalAssetSupply;
            availableFarm.supportedTokens = supportedTokens;
            availableFarm.depositedAmount = depositedAmount;
            availableFarm.poolShare = poolShare;
          }),
      ).then(() => {
        setAssetsInfo({
          numberOfAssets: numberOfAssets,
          numberOfChainsWithAssets: chainsWithAssets.size,
        });
        if (!cookies.has_seen_boost_farms) {
          availableFarms.sort(function (a, b) {
            return a.isBooster ? -1 : 1;
          });
        }
        setAvailableFarms(availableFarms);
        setAllSupportedTokens(Array.from(allSupportedTokens));
      });
    } catch (error) {
      setError(error);
      console.log(error);
    }
    setIsLoading(false);
  };

  const fetchFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(farm.type, farm.chain),
      totalAssetSupply: await getTotalAssetSupply(farm.type, farm.chain),
      supportedTokens: await getSupportedTokensList(farm.type, farm.chain),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = toExactFixed(
        await getUserDepositedAmount(farm.type, farm.chain),
        4,
      );
      farmInfo.poolShare =
        farmInfo.depositedAmount > 0
          ? toExactFixed(
              Number(farmInfo.depositedAmount) /
                Number(farmInfo.totalAssetSupply),
              2,
            )
          : 0;
    }
    
    return farmInfo;
  };

  const fetchBoosterFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getBoosterFarmInterest(
        farm.farmAddress,
        farm.convexFarmIds,
        farm.chain,
      ),
      totalAssetSupply: await getTotalAssets(farm.farmAddress, farm.chain),
      supportedTokens: await Promise.all(
        farm.supportedTokensAddresses.map(async supportedtoken => {
          return await getSupportedTokensBasicInfo(supportedtoken, farm.chain);
        }),
      ),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = toExactFixed(
        await getUserDepositedLPAmount(farm.farmAddress, farm.chain),
        4,
      );
      farmInfo.poolShare =
        farmInfo.depositedAmount > 0
          ? toExactFixed(
              Number(farmInfo.depositedAmount) /
                Number(farmInfo.totalAssetSupply),
              2,
            )
          : 0;
    }

    return farmInfo;
  };

  const showAllFarms = () => {
    setNetworkFilter(null);
    setTokenFilter(null);
    setViewType(null);
  };

  const showYourFarms = () => {
    setViewType('your');
  };

  const sortBy = (field, isAsc) => {
    setSortField(field);
    setSortDirectionIsAsc(isAsc);
  };

  const filteredFarms = () => {
    let filteredFarms;

    filteredFarms =
      viewType == 'your'
        ? availableFarms.filter(farm => Number(farm.depositedAmount) > 0)
        : availableFarms;

    filteredFarms = tokenFilter
      ? filteredFarms.filter(farm =>
          farm.supportedTokens
            .map(supportedToken => supportedToken.symbol)
            .includes(tokenFilter),
        )
      : filteredFarms;

    filteredFarms = networkFilter
      ? filteredFarms.filter(
          farm =>
            farm.chain ==
            (networkFilter == 'Ethereum' ? EChain.ETHEREUM : EChain.POLYGON),
        )
      : filteredFarms;

    if (sortField) {
      switch (sortField) {
        case 'apy':
          filteredFarms = filteredFarms.sort(function (a, b) {
            return sortDirectionIsAsc
              ? +b.interest > +a.interest
                ? 1
                : -1
              : +a.interest > +b.interest
              ? 1
              : -1;
          });
          break;

        case 'pool share':
          filteredFarms = filteredFarms.sort(function (a, b) {
            return sortDirectionIsAsc
              ? +b.poolShare > +a.poolShare
                ? 1
                : -1
              : +a.poolShare > +b.poolShare
              ? 1
              : -1;
          });
          break;
          
        case 'balance':
          filteredFarms = filteredFarms.sort(function (a, b) {
            return sortDirectionIsAsc
              ? +b.balance > +a.balance
                ? 1
                : -1
              : +a.balance > +b.balance
              ? 1
              : -1;
          });
          break;

        default:
          break;
      }
    }
    return filteredFarms;
  };

  return {
    isLoading,
    error,
    availableFarms: filteredFarms(),
    assetsInfo,
    showAllFarms,
    showYourFarms,
    viewType,
    allSupportedTokens,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
    walletAccountAtom,
    sortBy,
    sortDirectionIsAsc,
  };
};
