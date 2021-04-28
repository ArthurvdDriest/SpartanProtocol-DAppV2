/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Col,
  Row,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap'
import UncontrolledTooltip from 'reactstrap/lib/UncontrolledTooltip'
import { useDispatch } from 'react-redux'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AssetSelect from '../../../components/AssetSelect/AssetSelect'
import { getAddresses, getItemFromArray } from '../../../utils/web3'
import { usePool } from '../../../store/pool'
import {
  BN,
  convertToWei,
  convertFromWei,
  formatFromWei,
  formatFromUnits,
} from '../../../utils/bigNumber'
import {
  calcDoubleSwapOutput,
  calcSwapOutput,
  calcSwapFee,
  calcDoubleSwapFee,
  calcValueInBase,
  calcLiquidityHoldings,
  calcShare,
  calcLiquidityUnitsAsym,
} from '../../../utils/web3Utils'
import {
  routerSwapAssets,
  routerSwapBaseToSynth,
  routerSwapSynthToBase,
  routerZapLiquidity,
} from '../../../store/router/actions'
import Approval from '../../../components/Approval/Approval'
import { useWeb3 } from '../../../store/web3'
import HelmetLoading from '../../../components/Loaders/HelmetLoading'
import { useSynth } from '../../../store/synth/selector'
import SwapPair from '../Swap/SwapPair'

const Swap = () => {
  const synth = useSynth()
  const { t } = useTranslation()
  const web3 = useWeb3()
  const wallet = useWallet()
  const dispatch = useDispatch()
  const addr = getAddresses()
  const pool = usePool()
  const location = useLocation()
  const [assetSwap1, setAssetSwap1] = useState('...')
  const [assetSwap2, setAssetSwap2] = useState('...')
  const [filter, setFilter] = useState(['token'])
  const [mode, setMode] = useState('token')
  const [assetParam1, setAssetParam1] = useState(
    new URLSearchParams(location.search).get(`asset1`),
  )
  const [assetParam2, setAssetParam2] = useState(
    new URLSearchParams(location.search).get(`asset2`),
  )

  useEffect(() => {
    const { poolDetails } = pool

    const getAssetDetails = () => {
      if (poolDetails?.length > 0) {
        let asset1 = JSON.parse(window.localStorage.getItem('assetSelected1'))
        let asset2 = JSON.parse(window.localStorage.getItem('assetSelected2'))
        const type1 = window.localStorage.getItem('assetType1')
        const type2 = window.localStorage.getItem('assetType2')

        if (poolDetails.find((asset) => asset.tokenAddress === assetParam1)) {
          ;[asset1] = poolDetails.filter(
            (asset) => asset.tokenAddress === assetParam1,
          )
          setAssetParam1('')
        }
        if (poolDetails.find((asset) => asset.tokenAddress === assetParam2)) {
          ;[asset2] = poolDetails.filter(
            (asset) => asset.tokenAddress === assetParam2,
          )
          setAssetParam2('')
        }

        if (type1 === 'pool') {
          setFilter(['pool'])
          setMode('pool')
          window.localStorage.setItem('assetType1', 'pool')
          window.localStorage.setItem('assetType2', 'pool')
          if (asset2?.tokenAddress === addr.sparta) {
            asset2 =
              asset1?.tokenAddress !== poolDetails[1].tokenAddress
                ? { tokenAddress: poolDetails[1].tokenAddress }
                : { tokenAddress: poolDetails[2].tokenAddress }
          }
        } else if (type1 === 'synth') {
          setFilter(['sparta'])
          setMode('synth')
          asset2 = { tokenAddress: addr.sparta }
          window.localStorage.setItem('assetType1', 'synth')
          window.localStorage.setItem('assetType2', 'token')
        } else if (asset1?.tokenAddress !== addr.sparta && type1 === 'token') {
          setFilter(['token'])
          setMode('token')
          window.localStorage.setItem('assetType1', 'token')
          window.localStorage.setItem('assetType2', 'token')
        } else if (asset1?.tokenAddress === addr.sparta && type2 === 'synth') {
          setFilter(['token', 'synth'])
          setMode('synth')
          window.localStorage.setItem('assetType1', 'token')
          window.localStorage.setItem('assetType2', 'synth')
        } else {
          setFilter(['token', 'synth'])
          setMode('token')
          window.localStorage.setItem('assetType1', 'token')
          if (type2 === 'pool') {
            window.localStorage.setItem('assetType2', 'token')
          }
        }

        if (asset2?.tokenAddress === asset1?.tokenAddress) {
          asset2 =
            asset1?.tokenAddress !== poolDetails[1].tokenAddress
              ? { tokenAddress: poolDetails[1].tokenAddress }
              : { tokenAddress: poolDetails[2].tokenAddress }
        }

        if (!asset1) {
          asset1 = { tokenAddress: addr.sparta }
        }

        if (!asset2) {
          asset2 = { tokenAddress: addr.bnb }
        }

        asset1 = getItemFromArray(asset1, poolDetails)
        asset2 = getItemFromArray(asset2, poolDetails)

        setAssetSwap1(asset1)
        setAssetSwap2(asset2)

        window.localStorage.setItem('assetSelected1', JSON.stringify(asset1))
        window.localStorage.setItem('assetSelected2', JSON.stringify(asset2))
      }
    }

    getAssetDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    pool.poolDetails,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.localStorage.getItem('assetSelected1'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.localStorage.getItem('assetSelected2'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.localStorage.getItem('assetType1'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.localStorage.getItem('assetType2'),
  ])

  const getToken = (tokenAddress) =>
    pool.tokenDetails.filter((i) => i.address === tokenAddress)[0]

  const getSynth = (tokenAddress) =>
    synth.synthDetails.filter((i) => i.tokenAddress === tokenAddress)[0]

  const swapInput1 = document.getElementById('swapInput1')
  const swapInput2 = document.getElementById('swapInput2')

  const clearInputs = () => {
    swapInput1.value = ''
    swapInput2.value = ''
    swapInput1.focus()
  }

  const handleReverseAssets = () => {
    const asset1 = JSON.parse(window.localStorage.getItem('assetSelected1'))
    const asset2 = JSON.parse(window.localStorage.getItem('assetSelected2'))
    const type1 = window.localStorage.getItem('assetType1')
    const type2 = window.localStorage.getItem('assetType2')
    window.localStorage.setItem('assetSelected1', JSON.stringify(asset2))
    window.localStorage.setItem('assetSelected2', JSON.stringify(asset1))
    window.localStorage.setItem('assetType1', type2)
    window.localStorage.setItem('assetType2', type1)
    clearInputs()
  }

  //= =================================================================================//
  // Functions SWAP calculations

  const getBalance = (asset) => {
    let item = ''
    let type = ''
    if (asset === 1) {
      item = assetSwap1
      type = window.localStorage.getItem('assetType1')
    } else {
      item = assetSwap2
      type = window.localStorage.getItem('assetType2')
    }
    if (type === 'token') {
      return getToken(item.tokenAddress)?.balance
    }
    if (type === 'pool') {
      return item.balance
    }
    if (type === 'synth') {
      return getSynth(item.tokenAddress)?.balance
    }
    return item.balanceTokens
  }

  const getSwapOutput = () => {
    if (assetSwap1?.tokenAddress === addr.sparta) {
      return calcSwapOutput(
        convertToWei(swapInput1?.value),
        assetSwap2?.tokenAmount,
        assetSwap2?.baseAmount,
      )
    }
    if (assetSwap2?.tokenAddress === addr.sparta) {
      return calcSwapOutput(
        convertToWei(swapInput1?.value),
        assetSwap1?.tokenAmount,
        assetSwap1?.baseAmount,
        true,
      )
    }
    return calcDoubleSwapOutput(
      convertToWei(swapInput1?.value),
      assetSwap1?.tokenAmount,
      assetSwap1?.baseAmount,
      assetSwap2?.tokenAmount,
      assetSwap2?.baseAmount,
    )
  }

  const getSwapFee = () => {
    // Fee in SPARTA via fee in TOKEN (Swap from SPARTA)
    if (assetSwap1?.tokenAddress === addr.sparta) {
      return calcValueInBase(
        assetSwap2?.tokenAmount,
        assetSwap2?.baseAmount,
        calcSwapFee(
          convertToWei(swapInput1?.value),
          assetSwap2?.tokenAmount,
          assetSwap2?.baseAmount,
        ),
      )
    }
    // Fee in SPARTA (Swap to SPARTA)
    if (assetSwap2?.tokenAddress === addr.sparta) {
      return calcSwapFee(
        convertToWei(swapInput1?.value),
        assetSwap1?.tokenAmount,
        assetSwap1?.baseAmount,
        true,
      )
    }
    // Fee in SPARTA via fee in token2 (swap token1 to token2)
    return calcValueInBase(
      assetSwap2?.tokenAmount,
      assetSwap2?.baseAmount,
      calcDoubleSwapFee(
        convertToWei(swapInput1?.value),
        assetSwap1?.tokenAmount,
        assetSwap1?.baseAmount,
        assetSwap2?.tokenAmount,
        assetSwap2?.baseAmount,
      ),
    )
  }

  //= =================================================================================//
  // Functions for SWAP input handling

  const handleInputChange = () => {
    if (assetSwap1?.tokenAddress === addr.sparta) {
      if (swapInput1?.value) {
        swapInput2.value = convertFromWei(
          calcSwapOutput(
            convertToWei(swapInput1?.value),
            assetSwap2.tokenAmount,
            assetSwap2.baseAmount,
            false,
          ),
        )
      }
    } else if (assetSwap2?.tokenAddress === addr.sparta) {
      if (swapInput1?.value) {
        swapInput2.value = convertFromWei(
          calcSwapOutput(
            convertToWei(swapInput1?.value),
            assetSwap1.tokenAmount,
            assetSwap1.baseAmount,
            true,
          ),
        )
      }
    } else if (swapInput1?.value) {
      swapInput2.value = convertFromWei(
        calcDoubleSwapOutput(
          convertToWei(swapInput1?.value),
          assetSwap1.tokenAmount,
          assetSwap1.baseAmount,
          assetSwap2.tokenAmount,
          assetSwap2.baseAmount,
        ),
      )
    }
  }

  //= =================================================================================//
  // Functions ZAP calculations

  const getZapRemoveBase = () => {
    if (assetSwap1 && swapInput1?.value) {
      return calcLiquidityHoldings(
        assetSwap1.baseAmount,
        convertToWei(swapInput1.value),
        assetSwap1.poolUnits,
      )
    }
    return '0'
  }

  const getZapRemoveToken = () => {
    if (assetSwap1 && swapInput1?.value) {
      return calcLiquidityHoldings(
        assetSwap1.tokenAmount,
        convertToWei(swapInput1.value),
        assetSwap1.poolUnits,
      )
    }
    return '0'
  }

  const getZapOtherRemoveBase = () => {
    if (assetSwap2 && swapInput2?.value) {
      return calcLiquidityHoldings(
        assetSwap2.baseAmount,
        convertToWei(swapInput2.value),
        assetSwap2.poolUnits,
      )
    }
    return '0'
  }

  const getZapOtherRemoveToken = () => {
    if (assetSwap2 && swapInput2?.value) {
      return calcLiquidityHoldings(
        assetSwap2.tokenAmount,
        convertToWei(swapInput2.value),
        assetSwap2.poolUnits,
      )
    }
    return '0'
  }

  const getZapSwap = () => {
    if (assetSwap1 && swapInput1?.value) {
      return calcSwapOutput(
        getZapRemoveToken(),
        BN(assetSwap1.tokenAmount).minus(getZapRemoveToken()),
        BN(assetSwap1.baseAmount).minus(getZapRemoveBase()),
        true,
      )
    }
    return '0'
  }

  const getZapSwapFee = () => {
    if (assetSwap1 && swapInput1?.value) {
      return calcSwapFee(
        getZapRemoveToken(),
        BN(assetSwap1.tokenAmount).minus(getZapRemoveToken()),
        BN(assetSwap1.baseAmount).minus(getZapRemoveBase()),
        true,
      )
    }
    return '0'
  }

  const getZapOutput = () => {
    if (assetSwap1 && swapInput1?.value) {
      return calcLiquidityUnitsAsym(
        BN(getZapRemoveBase()).plus(getZapSwap()),
        assetSwap2.baseAmount,
        assetSwap2.poolUnits,
      )
    }
    return '0'
  }

  //= =================================================================================//
  // Functions SYNTHS calculations

  const getSynthLPsFromBase = () => {
    const temp = calcLiquidityUnitsAsym(
      convertToWei(swapInput1.value),
      assetSwap2.baseAmount,
      assetSwap2.poolUnits,
    )
    return temp
  }

  const getSynthFeeFromBase = () => {
    let temp = calcSwapFee(
      convertToWei(swapInput1?.value),
      assetSwap2?.baseAmount,
      assetSwap2?.tokenAmount,
    )
    temp = calcValueInBase(assetSwap2.tokenAmount, assetSwap2.baseAmount, temp)
    return temp
  }

  const getSynthOutputFromBase = () => {
    const lpUnits = getSynthLPsFromBase()
    const baseAmount = calcShare(
      lpUnits,
      BN(assetSwap2.poolUnits).plus(lpUnits),
      BN(assetSwap2.baseAmount).plus(BN(swapInput1.value)),
    )
    const tokenAmount = calcShare(
      lpUnits,
      BN(assetSwap2.poolUnits).plus(lpUnits),
      assetSwap2.tokenAmount,
    )
    const baseSwapped = calcSwapOutput(
      baseAmount,
      assetSwap2.tokenAmount,
      BN(assetSwap2.baseAmount).plus(BN(swapInput1.value)),
    )
    const tokenValue = BN(tokenAmount).plus(baseSwapped)
    return tokenValue
  }

  const getSynthFeeToBase = () => {
    const fee = calcSwapFee(
      convertToWei(swapInput1.value),
      assetSwap1.baseAmount,
      assetSwap1.tokenAmount,
      true,
    )
    return fee
  }

  const getSynthOutputToBase = () => {
    const inputSynth = convertToWei(swapInput1?.value)
    const baseOutput = calcSwapOutput(
      inputSynth,
      assetSwap1.tokenAmount,
      assetSwap1.baseAmount,
      true,
    )
    return baseOutput
  }

  //= =================================================================================//
  // Functions for input handling

  const handleZapInputChange = () => {
    if (mode === 'token') {
      handleInputChange()
    } else if (mode === 'pool') {
      if (swapInput1?.value) {
        swapInput2.value = convertFromWei(getZapOutput(), 18)
      } else {
        clearInputs()
      }
    } else if (mode === 'synth' && assetSwap1?.tokenAddress === addr.sparta) {
      if (swapInput1?.value) {
        swapInput2.value = convertFromWei(getSynthOutputFromBase(), 18)
      } else {
        clearInputs()
      }
    } else if (mode === 'synth' && assetSwap2?.tokenAddress === addr.sparta) {
      if (swapInput1?.value) {
        swapInput2.value = convertFromWei(getSynthOutputToBase(), 18)
      } else {
        clearInputs()
      }
    }
  }

  // GET USD VALUES
  const getInput1USD = () => {
    if (mode === 'token' || mode === 'synth') {
      if (assetSwap1?.tokenAddress === addr.sparta && swapInput1?.value) {
        return BN(convertToWei(swapInput1?.value)).times(web3.spartaPrice)
      }
      if (assetSwap1?.tokenAddress !== addr.sparta && swapInput1?.value) {
        return BN(
          calcValueInBase(
            assetSwap1?.tokenAmount,
            assetSwap1?.baseAmount,
            convertToWei(swapInput1?.value),
          ),
        ).times(web3.spartaPrice)
      }
    } else if (mode === 'pool') {
      if (assetSwap1 && swapInput1?.value) {
        return BN(
          calcValueInBase(
            assetSwap1?.tokenAmount,
            assetSwap1?.baseAmount,
            getZapRemoveToken(),
          ),
        )
          .plus(getZapRemoveBase())
          .times(web3.spartaPrice)
      }
    }
    return '0'
  }

  // GET USD VALUES
  const getInput2USD = () => {
    if (mode === 'token' || mode === 'synth') {
      if (assetSwap2?.tokenAddress === addr.sparta && swapInput2?.value) {
        return BN(convertToWei(swapInput2?.value)).times(web3.spartaPrice)
      }
      if (assetSwap2?.tokenAddress !== addr.sparta && swapInput2?.value) {
        return BN(
          calcValueInBase(
            assetSwap2?.tokenAmount,
            assetSwap2?.baseAmount,
            convertToWei(swapInput2?.value),
          ),
        ).times(web3.spartaPrice)
      }
    } else if (mode === 'pool') {
      if (assetSwap2 && swapInput2?.value) {
        return BN(
          calcValueInBase(
            assetSwap2?.tokenAmount,
            assetSwap2?.baseAmount,
            getZapOtherRemoveToken(),
          ),
        )
          .plus(getZapOtherRemoveBase())
          .times(web3.spartaPrice)
      }
    }
    return '0'
  }

  const getRateSlip = () => {
    if (assetSwap1 && swapInput1?.value > 0 && swapInput2?.value > 0) {
      return BN(getInput2USD()).div(getInput1USD()).minus('1').times('100')
    }
    return '0'
  }

  return (
    <>
      <div className="content">
        {pool.poolDetails?.length > 0 && (
          <>
            <Row className="card-body justify-content-center">
              <Col xs="12">
                <h2 className="d-inline text-title ml-1">{t('synths')}</h2>
                <h6>
                  Rebuild this as a simple synths mint/burn interface for those
                  who dont understand swapping for a synth
                </h6>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col xs="12" xl="9">
                <Card className="card-body">
                  {/* Top 'Input' Row */}
                  <Row>
                    {/* 'From' input box */}
                    <Col xs="12" md="5">
                      <Card
                        style={{ backgroundColor: '#25212D' }}
                        className="card-body"
                      >
                        <Row>
                          <Col xs={4} className="mt-md-1">
                            <div className="title-card">Sell</div>
                          </Col>
                          <Col xs={8} className="text-right">
                            <div
                              className="balance"
                              role="button"
                              onClick={() => {
                                swapInput1.value = convertFromWei(getBalance(1))
                                handleZapInputChange(
                                  convertFromWei(getBalance(1)),
                                  true,
                                )
                              }}
                            >
                              {t('balance')}
                              {': '}
                              {formatFromWei(getBalance(1), 4)}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs="4" lg="5" xl="6">
                            <div className="ml-2">
                              <AssetSelect
                                priority="1"
                                filter={['token', 'pool', 'synth']}
                              />
                            </div>
                          </Col>
                          <Col xs="8" lg="7" xl="6">
                            <InputGroup className="m-0">
                              <Input
                                className="text-right"
                                type="text"
                                placeholder="'Sell' amount..."
                                id="swapInput1"
                                onInput={(event) =>
                                  handleZapInputChange(event.target.value, true)
                                }
                              />
                              <InputGroupAddon
                                addonType="append"
                                role="button"
                                tabIndex={-1}
                                onKeyPress={() => clearInputs()}
                                onClick={() => clearInputs()}
                              >
                                <i className="icon-search-bar icon-close icon-light my-auto mt-1" />
                              </InputGroupAddon>
                            </InputGroup>
                            <div className="text-right">
                              ~$
                              {swapInput1?.value &&
                                formatFromWei(getInput1USD(), 2)}
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>

                    <Col xs="12" md="2" className="h-auto">
                      <div
                        className="d-block d-md-none text-center"
                        style={{ marginTop: '-50px' }}
                      >
                        <Button
                          className="btn-sm btn-rounded btn-icon z-index"
                          color="primary"
                          onClick={() => handleReverseAssets()}
                        >
                          <i className="icon-swap-size icon-swap icon-light mt-1" />
                        </Button>
                      </div>
                      <div className="d-none d-md-block card-body text-center">
                        <Button
                          className="btn-lg btn-rounded btn-icon mt-3"
                          color="primary"
                          onClick={() => handleReverseAssets()}
                        >
                          <i className="icon-medium icon-swap icon-light mt-1" />
                        </Button>
                      </div>
                    </Col>
                    {/* 'To' input box */}
                    <Col
                      xs="12"
                      md="5"
                      style={{ marginTop: '-25px' }}
                      className="mt-md-1"
                    >
                      <Card
                        style={{ backgroundColor: '#25212D' }}
                        className="card-body "
                      >
                        <Row>
                          <Col xs={4}>
                            <div className="title-card">Buy</div>
                          </Col>
                          <Col xs={8} className="text-right balance">
                            <div>
                              Balance{': '}
                              {pool.poolDetails &&
                                formatFromWei(getBalance(2), 4)}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs="4" lg="5" xl="6">
                            <div className="ml-2">
                              <AssetSelect
                                priority="2"
                                filter={filter}
                                blackList={[assetSwap1?.tokenAddress]}
                              />
                            </div>
                          </Col>
                          <Col xs="8" lg="7" xl="6">
                            <InputGroup className="m-0">
                              <Input
                                className="text-right"
                                type="text"
                                placeholder="'Buy' amount..."
                                id="swapInput2"
                                readOnly
                                onInput={(event) =>
                                  handleZapInputChange(
                                    event.target.value,
                                    false,
                                  )
                                }
                              />
                              <InputGroupAddon
                                addonType="append"
                                role="button"
                                tabIndex={-1}
                                onKeyPress={() => clearInputs()}
                                onClick={() => clearInputs()}
                              >
                                <i className="icon-search-bar icon-close icon-light my-auto mt-1" />
                              </InputGroupAddon>
                            </InputGroup>
                            <div className="text-right">
                              ~$
                              {swapInput2?.value &&
                                formatFromWei(getInput2USD(), 2)}
                              {' ('}
                              {swapInput1?.value &&
                                formatFromUnits(getRateSlip())}
                              {'%)'}
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                  {/* Bottom 'swap' txnDetails row */}
                  {mode === 'token' && (
                    <>
                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="text-card">Input</div>
                        </Col>
                        <Col className="text-right">
                          <div className="output-card">
                            {swapInput1?.value &&
                              formatFromUnits(swapInput1?.value, 6)}{' '}
                            {getToken(assetSwap1.tokenAddress)?.symbol}
                          </div>
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="text-card">
                            {t('fee')}
                            <i
                              className="icon-small icon-info icon-dark ml-2 mt-n1"
                              id="tooltipFee"
                              role="button"
                            />
                            <UncontrolledTooltip
                              placement="right"
                              target="tooltipFee"
                            >
                              The slip fee being injected into the pool with
                              this txn to reward liquidity providers.
                            </UncontrolledTooltip>
                          </div>
                        </Col>
                        <Col className="text-right">
                          <div className="output-card">
                            {swapInput1?.value &&
                              formatFromWei(getSwapFee(), 6)}{' '}
                            SPARTA
                          </div>
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="amount align-items-center">
                            Output
                          </div>
                        </Col>
                        <Col className="text-right">
                          <div className="subtitle-amount">
                            {swapInput1?.value &&
                              formatFromWei(getSwapOutput(), 6)}{' '}
                            {getToken(assetSwap2.tokenAddress)?.symbol}
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}

                  {/* Bottom 'zap' txnDetails row */}
                  {mode === 'pool' && (
                    <>
                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="text-card">{t('input')}</div>
                        </Col>
                        <Col className="text-right">
                          <div className="output-card">
                            {swapInput1?.value &&
                              formatFromUnits(swapInput1?.value, 6)}{' '}
                            {getToken(assetSwap1.tokenAddress)?.symbol}-SPP
                          </div>
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="text-card">
                            {t('fee')}
                            <i
                              className="icon-small icon-info icon-dark ml-2 mt-n1"
                              id="tooltipZapFee"
                              role="button"
                            />
                            <UncontrolledTooltip
                              placement="right"
                              target="tooltipZapFee"
                            >
                              {t(
                                'The slip fee being injected into the pool to reward the liquidity providers',
                              )}
                            </UncontrolledTooltip>
                          </div>
                        </Col>
                        <Col className="text-right">
                          <div className="output-card">
                            {swapInput1?.value &&
                              formatFromWei(getZapSwapFee(), 6)}{' '}
                            SPARTA
                          </div>
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="amount">{t('output')}</div>
                        </Col>
                        <Col className="text-right">
                          <div className="subtitle-amount">
                            {swapInput1?.value &&
                              formatFromWei(getZapOutput(), 6)}{' '}
                            {getToken(assetSwap2.tokenAddress)?.symbol}-SPP
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}

                  {/* Bottom 'synth' txnDetails row */}
                  {mode === 'synth' && (
                    <>
                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="text-card">{t('input')}</div>
                        </Col>
                        <Col className="text-right">
                          <div className="output-card">
                            {swapInput1?.value &&
                              formatFromUnits(swapInput1?.value, 6)}{' '}
                            {getToken(assetSwap1.tokenAddress)?.symbol}
                            {assetSwap1?.tokenAddress !== addr.sparta && '-SPS'}
                          </div>
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="text-card">
                            Fee{' '}
                            <i
                              className="icon-small icon-info icon-dark ml-2 mt-n1"
                              id="tooltipSynthFee"
                              role="button"
                            />
                            <UncontrolledTooltip
                              placement="right"
                              target="tooltipSynthFee"
                            >
                              The slip fee being injected into the pool to
                              reward the liquidity providers
                            </UncontrolledTooltip>
                          </div>
                        </Col>
                        <Col className="text-right">
                          <div className="output-card">
                            {swapInput1?.value &&
                              assetSwap1?.tokenAddress === addr.sparta &&
                              formatFromWei(getSynthFeeFromBase(), 6)}
                            {swapInput1?.value &&
                              assetSwap1?.tokenAddress !== addr.sparta &&
                              formatFromWei(getSynthFeeToBase(), 6)}{' '}
                            SPARTA
                          </div>
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col xs="auto">
                          <div className="amount">Output</div>
                        </Col>
                        <Col className="text-right">
                          <div className="subtitle-amount">
                            {swapInput1?.value &&
                              assetSwap1?.tokenAddress === addr.sparta &&
                              `${formatFromWei(getSynthOutputFromBase(), 10)} ${
                                getToken(assetSwap2.tokenAddress)?.symbol
                              }-SPP`}
                            {swapInput1?.value &&
                              assetSwap1?.tokenAddress !== addr.sparta &&
                              `${formatFromWei(getSynthOutputToBase(), 10)} ` +
                                `SPARTA`}
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}
                  {/* 'Approval/Allowance' row */}
                  <Row>
                    {mode === 'token' &&
                      assetSwap1?.tokenAddress !== addr.bnb &&
                      wallet?.account &&
                      swapInput1?.value && (
                        <Approval
                          tokenAddress={assetSwap1?.tokenAddress}
                          symbol={assetSwap1?.symbol}
                          walletAddress={wallet?.account}
                          contractAddress={addr.router}
                          txnAmount={convertToWei(swapInput1?.value)}
                          assetNumber="1"
                        />
                      )}
                    {mode === 'token' && (
                      <Col>
                        <Button
                          color="primary"
                          size="lg"
                          onClick={() =>
                            dispatch(
                              routerSwapAssets(
                                convertToWei(swapInput1?.value),
                                assetSwap1.tokenAddress,
                                assetSwap2.tokenAddress,
                              ),
                            )
                          }
                          block
                        >
                          Sell {assetSwap1?.symbol}
                        </Button>
                      </Col>
                    )}
                    {mode === 'pool' && (
                      <Col>
                        <Button
                          color="primary"
                          size="lg"
                          onClick={() =>
                            dispatch(
                              routerZapLiquidity(
                                convertToWei(swapInput1?.value),
                                assetSwap1.tokenAddress,
                                assetSwap2.tokenAddress,
                              ),
                            )
                          }
                          block
                        >
                          Sell {getToken(assetSwap1.tokenAddress)?.symbol}-SPP
                        </Button>
                      </Col>
                    )}
                    {mode === 'synth' &&
                      JSON.parse(window.localStorage.getItem('assetSelected1'))
                        .tokenAddress === addr.sparta && (
                        <Col>
                          <Button
                            color="primary"
                            size="lg"
                            onClick={() =>
                              dispatch(
                                routerSwapBaseToSynth(
                                  convertToWei(swapInput1?.value),
                                  getSynth(assetSwap2.tokenAddress)?.address,
                                ),
                              )
                            }
                            block
                          >
                            Sell SPARTA
                          </Button>
                        </Col>
                      )}

                    {mode === 'synth' &&
                      JSON.parse(window.localStorage.getItem('assetSelected1'))
                        .tokenAddress !== addr.sparta && (
                        <Col>
                          <Button
                            color="primary"
                            size="lg"
                            onClick={() =>
                              dispatch(
                                routerSwapSynthToBase(
                                  convertToWei(swapInput1?.value),
                                  getSynth(assetSwap1.tokenAddress)?.address,
                                ),
                              )
                            }
                            block
                          >
                            Sell {getToken(assetSwap1.tokenAddress)?.symbol}-SPS
                          </Button>
                        </Col>
                      )}
                  </Row>
                </Card>
              </Col>
              <Col xs="12" xl="9">
                <Row>
                  <Col xs="12" md="6">
                    {pool.poolDetails &&
                      assetSwap1.tokenAddress !== addr.sparta && (
                        <SwapPair assetSwap={assetSwap1} />
                      )}
                  </Col>
                  <Col xs="12" md="6">
                    {pool.poolDetails &&
                      assetSwap2.tokenAddress !== addr.sparta && (
                        <SwapPair assetSwap={assetSwap2} />
                      )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}
        {!pool.poolDetails && (
          <div>
            <HelmetLoading height={300} width={300} />
          </div>
        )}
      </div>
    </>
  )
}

export default Swap