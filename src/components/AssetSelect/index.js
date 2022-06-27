import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useWeb3React } from '@web3-react/core'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Nav from 'react-bootstrap/Nav'
import Modal from 'react-bootstrap/Modal'

import ShareLink from '../Share/ShareLink'
import { Icon } from '../Icons/index'

import { usePool } from '../../store/pool'
import { formatFromWei } from '../../utils/bigNumber'
import { watchAsset } from '../../store/web3'
import { useSynth } from '../../store/synth'
import { useApp } from '../../store/app'

import spartaLpIcon from '../../assets/tokens/sparta-lp.svg'
import spartaSynthIcon from '../../assets/tokens/sparta-synth.svg'
import { getSynth, getToken } from '../../utils/math/utils'

/**
 * An asset selection dropdown. Selection is stored in localStorage under 'assetSelected1' or 'assetSelected2'
 * depending on the 'priority' prop handed over.
 * Can be extended out with 'assetSelected3' etc in the future but the current views will only handle '1' and '2' for now
 * @param {uint} priority '1' or '2'
 * @param {string} type 'pools' (Shows SP-p related fields)
 * @param {array} whiteList tokenAddresses [array]
 * @param {array} blackList tokenAddresses [array]
 */
const AssetSelect = (props) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const wallet = useWeb3React()

  const { addresses } = useApp()
  const pool = usePool()
  const synth = useSynth()

  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState(
    props.defaultTab ? props.defaultTab : 'all',
  )

  const isBNB = (asset) => {
    if (asset.address === addresses.bnb && asset.actualAddr === addresses.bnb)
      return true
    return false
  }

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  const changeTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const searchInput = document.getElementById('searchInput')

  const clearSearch = () => {
    searchInput.value = ''
  }

  const addSelection = (asset) => {
    const tempAsset = pool.poolDetails.filter(
      (i) => i.tokenAddress === asset.address,
    )
    window.localStorage.setItem(
      `assetSelected${props.priority}`,
      JSON.stringify(tempAsset[0]),
    )
    window.localStorage.setItem(`assetType${props.priority}`, asset.type)
  }

  const tryParse = (data) => {
    try {
      return JSON.parse(data)
    } catch (e) {
      return pool.poolDetails[0]
    }
  }

  const [selectedItem, setSelectedItem] = useState(
    tryParse(window.localStorage.getItem(`assetSelected${props.priority}`)),
  )
  const [selectedType, setSelectedType] = useState(
    window.localStorage.getItem(`assetType${props.priority}`),
  )

  useEffect(() => {
    const _tryParse = (data) => {
      try {
        return JSON.parse(data)
      } catch (e) {
        return pool.poolDetails[0]
      }
    }
    setSelectedItem(
      _tryParse(window.localStorage.getItem(`assetSelected${props.priority}`)),
    )
    setSelectedType(window.localStorage.getItem(`assetType${props.priority}`))
  }, [
    pool.poolDetails,
    props.priority,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.localStorage.getItem(`assetType${props.priority}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.localStorage.getItem(`assetSelected${props.priority}`),
  ])

  const [assetArray, setAssetArray] = useState([])

  const _getToken = (tokenAddress) => getToken(tokenAddress, pool.tokenDetails)

  useEffect(() => {
    const __getToken = (tokenAddress) =>
      getToken(tokenAddress, pool.tokenDetails)
    let finalArray = []
    const getArray = () => {
      if (pool.poolDetails) {
        let tempArray = pool.poolDetails.filter(
          (asset) => !props.empty && !asset.hide,
        )

        if (props.whiteList) {
          tempArray = tempArray.filter((asset) =>
            props.whiteList.find(
              (item) => item === asset.tokenAddress || item === asset.address,
            ),
          )
        }

        if (props.blackList) {
          tempArray = tempArray.filter(
            (asset) =>
              props.blackList.find((item) => asset.tokenAddress === item) ===
              undefined,
          )
        }

        for (let i = 0; i < tempArray.length; i++) {
          // Add only sparta
          if (props.filter?.includes('sparta')) {
            if (tempArray[i].tokenAddress === addresses.spartav2) {
              finalArray.push({
                type: 'token',
                icon: (
                  <img
                    className="rounded-circle"
                    height="35px"
                    src={__getToken(tempArray[i].tokenAddress)?.symbolUrl}
                    alt={`${
                      __getToken(tempArray[i].tokenAddress)?.symbol
                    } asset icon`}
                  />
                ),
                iconUrl: __getToken(tempArray[i].tokenAddress)?.symbolUrl,
                symbol: __getToken(tempArray[i].tokenAddress)?.symbol,
                balance: __getToken(tempArray[i].tokenAddress)?.balance,
                address: tempArray[i].tokenAddress,
                actualAddr: tempArray[i].tokenAddress,
              })
            }
          }

          // Add asset to array
          if (props.filter?.includes('token')) {
            finalArray.push({
              type: 'token',
              icon: (
                <img
                  className="rounded-circle"
                  height="35px"
                  src={__getToken(tempArray[i].tokenAddress)?.symbolUrl}
                  alt={`${
                    __getToken(tempArray[i].tokenAddress)?.symbol
                  } asset icon`}
                />
              ),
              iconUrl: __getToken(tempArray[i].tokenAddress)?.symbolUrl,
              symbol: __getToken(tempArray[i].tokenAddress)?.symbol,
              balance: __getToken(tempArray[i].tokenAddress)?.balance,
              address: tempArray[i].tokenAddress,
              actualAddr: tempArray[i].tokenAddress,
            })
          }

          // Add LP token to array
          if (props.filter?.includes('pool')) {
            if (tempArray[i].address) {
              finalArray.push({
                type: 'pool',
                icon: (
                  <>
                    <img
                      className="rounded-circle"
                      height="35px"
                      src={__getToken(tempArray[i].tokenAddress)?.symbolUrl}
                      alt={`${
                        __getToken(tempArray[i].tokenAddress)?.symbol
                      } LP token icon`}
                    />
                    <img
                      src={spartaLpIcon}
                      height="20px"
                      className="token-badge"
                      alt={`${
                        __getToken(tempArray[i].tokenAddress)?.symbol
                      } LP token icon`}
                    />
                  </>
                ),
                iconUrl: __getToken(tempArray[i].tokenAddress)?.symbolUrl,
                symbol: `${__getToken(tempArray[i].tokenAddress)?.symbol}p`,
                balance: tempArray[i].balance,
                address: tempArray[i].tokenAddress,
                actualAddr: tempArray[i].address,
              })
            }
          }

          // Add synth to array
          if (props.filter?.includes('synth')) {
            if (
              getSynth(tempArray[i].tokenAddress, synth.synthDetails)
                ?.address !== false
            ) {
              finalArray.push({
                type: 'synth',
                iconUrl: __getToken(tempArray[i].tokenAddress)?.symbolUrl,
                icon: (
                  <>
                    <img
                      className="rounded-circle"
                      height="35px"
                      src={__getToken(tempArray[i].tokenAddress)?.symbolUrl}
                      alt={`${
                        __getToken(tempArray[i].tokenAddress)?.symbol
                      } synth icon`}
                    />
                    <img
                      src={spartaSynthIcon}
                      height="20px"
                      className="token-badge"
                      alt={`${
                        __getToken(tempArray[i].tokenAddress)?.symbol
                      } LP token icon`}
                    />
                  </>
                ),
                symbol: `${__getToken(tempArray[i].tokenAddress)?.symbol}s`,
                balance: getSynth(tempArray[i].tokenAddress, synth.synthDetails)
                  ?.balance,
                address: tempArray[i].tokenAddress,
                actualAddr: getSynth(
                  tempArray[i].tokenAddress,
                  synth.synthDetails,
                )?.address,
              })
            }
          }
        }
        if (searchInput?.value) {
          finalArray = finalArray.filter((asset) =>
            asset.symbol
              .toLowerCase()
              .includes(searchInput.value.toLowerCase()),
          )
        }
        finalArray = finalArray.sort((a, b) => b.balance - a.balance)
        setAssetArray(finalArray)
      }
    }
    getArray()
  }, [
    addresses.spartav2,
    pool.poolDetails,
    pool.tokenDetails,
    props.blackList,
    props.empty,
    props.filter,
    props.whiteList,
    searchInput?.value,
    synth.synthDetails,
  ])

  const getWalletType = () => {
    if (window.localStorage.getItem('lastWallet') === 'MM') {
      return 'MM'
    }
    if (window.localStorage.getItem('lastWallet') === 'TW') {
      return 'TW'
    }
    return false
  }

  const handleWatchAsset = (asset) => {
    const walletType = getWalletType()
    if (walletType === 'MM' && !isBNB(asset)) {
      dispatch(
        watchAsset(
          asset.actualAddr,
          asset.symbol,
          '18',
          asset.iconUrl,
          wallet.account,
        ),
      )
    }
  }

  const handleOnClick = () => {
    toggleModal()
    if (props.onClick) {
      props.onClick()
    }
  }

  return (
    <>
      <Row
        onClick={() =>
          !props.disabled ? handleOnClick() : console.log('button disabled')
        }
        role="button"
      >
        <Col xs="auto" className="position-relative pe-1 ps-0">
          {selectedType === 'token' && (
            <img
              className="rounded-circle"
              height="40px"
              src={_getToken(selectedItem?.tokenAddress)?.symbolUrl}
              alt={`${_getToken(selectedItem?.tokenAddress)?.symbol}icon`}
            />
          )}

          {selectedType === 'pool' && (
            <>
              <img
                className="rounded-circle"
                height="40px"
                src={_getToken(selectedItem?.tokenAddress)?.symbolUrl}
                alt={`${_getToken(selectedItem?.tokenAddress)?.symbol}icon`}
              />
              <img
                src={spartaLpIcon}
                height="22px"
                className="token-badge-tight"
                alt={`${
                  _getToken(selectedItem?.tokenAddress)?.symbol
                } LP token icon`}
              />
            </>
          )}

          {selectedType === 'synth' && (
            <>
              <img
                className="rounded-circle"
                height="40px"
                src={_getToken(selectedItem?.tokenAddress)?.symbolUrl}
                alt={`${_getToken(selectedItem?.tokenAddress)?.symbol}icon`}
              />
              <img
                src={spartaSynthIcon}
                height="22px"
                className="token-badge-tight"
                alt={`${
                  _getToken(selectedItem?.tokenAddress)?.symbol
                } LP token icon`}
              />
            </>
          )}
        </Col>
        <Col className="px-1 my-auto overflow-hidden">
          <h4 className="mb-0">
            {selectedItem && _getToken(selectedItem?.tokenAddress)?.symbol}
            {selectedType === 'pool' && 'p'}
            {selectedType === 'synth' && 's'}
            {!props.disabled && (
              <Icon icon="arrowDown" size="13" className="ms-2" />
            )}
          </h4>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('selectAnAsset')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Nav activeKey={activeTab} fill>
            <Nav.Item key="all">
              <Nav.Link
                eventKey="all"
                onClick={() => {
                  changeTab('all')
                }}
              >
                {t('all')}
              </Nav.Link>
            </Nav.Item>
            {assetArray.filter((asset) => asset.type === 'token').length >
              0 && (
              <Nav.Item key="token">
                <Nav.Link
                  eventKey="token"
                  onClick={() => {
                    changeTab('token')
                  }}
                >
                  {t('tokens')}
                </Nav.Link>
              </Nav.Item>
            )}
            {assetArray.filter((asset) => asset.type === 'pool').length > 0 && (
              <Nav.Item key="pool">
                <Nav.Link
                  eventKey="pool"
                  onClick={() => {
                    changeTab('pool')
                  }}
                >
                  {t('lpTokens')}
                </Nav.Link>
              </Nav.Item>
            )}
            {assetArray.filter((asset) => asset.type === 'synth').length >
              0 && (
              <Nav.Item key="synth">
                <Nav.Link
                  eventKey="synth"
                  onClick={() => {
                    changeTab('synth')
                  }}
                >
                  {t('synths')}
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>

          <Row className="my-3">
            <Col xs="12" className="m-auto">
              <InputGroup>
                <InputGroup.Text>
                  <Icon size="18" icon="search" xs="18" fill="grey" />
                </InputGroup.Text>
                <FormControl
                  autoComplete="off"
                  autoCorrect="off"
                  placeholder={t('searchAssets')}
                  type="text"
                  id="searchInput"
                />
                <InputGroup.Text
                  role="button"
                  tabIndex={-1}
                  onKeyPress={() => clearSearch()}
                  onClick={() => clearSearch()}
                >
                  <Icon size="12" icon="close" xs="12" fill="grey" />
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>

          {activeTab === 'all' &&
            assetArray.map((asset) => (
              <Row key={`${asset.actualAddr}-all`} className="mb-3">
                <Col xs="auto" className="position-relative">
                  <div
                    role="button"
                    aria-hidden="true"
                    onClick={() => {
                      addSelection(asset)
                      toggleModal()
                    }}
                  >
                    {asset.icon}
                  </div>
                </Col>

                <Col xs="5" sm="7" className="align-items-center p-0 ps-sm-1">
                  <Row>
                    <Col xs="12" className="float-left">
                      <strong
                        role="button"
                        aria-hidden="true"
                        onClick={() => {
                          addSelection(asset)
                          toggleModal()
                        }}
                      >
                        {asset.symbol}
                      </strong>
                      <div>{formatFromWei(asset.balance)}</div>
                    </Col>
                  </Row>
                </Col>

                <Col xs="3" md="3" className="text-end p-0 pe-2">
                  <Row>
                    <Col xs="6">
                      <ShareLink url={asset.actualAddr}>
                        <Icon icon="copy" size="24" className="ms-2" />
                      </ShareLink>
                    </Col>
                    {getWalletType() && (
                      <Col xs="6">
                        <a
                          href={
                            getWalletType() === 'TW'
                              ? `trust://add_asset?asset=c20000714_t${asset.actualAddr}`
                              : '#section'
                          }
                        >
                          <div
                            role="button"
                            aria-hidden="true"
                            onClick={() => {
                              handleWatchAsset(asset)
                            }}
                          >
                            {!isBNB(asset) && (
                              <>
                                {getWalletType() === 'MM' ? (
                                  <Icon
                                    icon="metamask"
                                    size="24"
                                    className="ms-2"
                                  />
                                ) : (
                                  getWalletType() === 'TW' && (
                                    <Icon
                                      icon="trustwallet"
                                      size="24"
                                      className="ms-2"
                                    />
                                  )
                                )}
                              </>
                            )}
                          </div>
                        </a>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>
            ))}

          {activeTab !== 'all' &&
            assetArray
              .filter((asset) => asset.type === activeTab)
              .map((asset) => (
                <Row
                  key={asset.actualAddr + activeTab}
                  className="mb-3 output-card"
                >
                  <Col xs="auto" className="position-relative">
                    <div
                      role="button"
                      aria-hidden="true"
                      onClick={() => {
                        addSelection(asset)
                        toggleModal()
                      }}
                    >
                      {asset.icon}
                    </div>
                  </Col>

                  <Col xs="5" sm="7" className="align-items-center p-0 ps-sm-1">
                    <Row>
                      <Col xs="12" className="float-left">
                        <strong
                          role="button"
                          aria-hidden="true"
                          onClick={() => {
                            addSelection(asset)
                            toggleModal()
                          }}
                        >
                          {asset.symbol}
                        </strong>
                        <div>{formatFromWei(asset.balance)}</div>
                      </Col>
                    </Row>
                  </Col>

                  <Col xs="3" md="3" className="text-end p-0 pe-2">
                    <Row>
                      <Col xs="6">
                        <ShareLink url={asset.actualAddr}>
                          <Icon icon="copy" size="24" className="ms-2" />
                        </ShareLink>
                      </Col>
                      {getWalletType() && (
                        <Col xs="6">
                          <a
                            href={
                              getWalletType() === 'TW'
                                ? `trust://add_asset?asset=c20000714_t${asset.actualAddr}`
                                : '#section'
                            }
                          >
                            <div
                              role="button"
                              aria-hidden="true"
                              onClick={() => {
                                handleWatchAsset(asset)
                              }}
                            >
                              {!isBNB(asset) && (
                                <>
                                  {getWalletType() === 'MM' ? (
                                    <Icon
                                      icon="metamask"
                                      size="24"
                                      className="ms-2"
                                    />
                                  ) : (
                                    getWalletType() === 'TW' && (
                                      <Icon
                                        icon="trustwallet"
                                        size="24"
                                        className="ms-2"
                                      />
                                    )
                                  )}
                                </>
                              )}
                            </div>
                          </a>
                        </Col>
                      )}
                    </Row>
                  </Col>
                </Row>
              ))}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default AssetSelect
