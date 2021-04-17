/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable*/
import React, { useEffect, useState } from "react"
import {
  Button,
  Modal,
  Row,
  Col,
  Card,
  CardHeader,
  CardTitle,
  Nav,
  NavItem,
  NavLink,
  CardBody,
  InputGroup,
  Input,
  InputGroupAddon,
  InputGroupText
} from "reactstrap"
import classnames from "classnames"
import { useDispatch } from "react-redux"
import { usePoolFactory } from "../../store/poolFactory"
import { formatFromWei } from "../../utils/bigNumber"
import { watchAsset } from "../../store/web3"
import ShareLink from "../Share/ShareLink"
// import MetaMask from '../../assets/icons/metamask.svg'
import spartaIcon from "../../assets/img/spartan_lp.svg"
import spartaIconAlt from "../../assets/img/spartan_synth.svg"
import ModalHeader from "react-bootstrap/ModalHeader"
import ModalBody from "reactstrap/es/ModalBody"
import ModalFooter from "reactstrap/es/ModalFooter"

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
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)

  const [activeTab, setActiveTab] = useState("all")
  const poolFactory = usePoolFactory()

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  const changeTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const searchInput = document.getElementById("searchInput")

  const clearSearch = () => {
    searchInput.value = ""
  }

  const addSelection = (asset) => {
    const tempAsset = poolFactory.finalLpArray.filter(
      (i) => i.tokenAddress === asset.address
    )
    window.localStorage.setItem(
      `assetSelected${props.priority}`,
      JSON.stringify(tempAsset[0])
    )
    window.localStorage.setItem(`assetType${props.priority}`, asset.type)
  }

  const selectedItem = JSON.parse(
    window.localStorage.getItem(`assetSelected${props.priority}`)
  )

  const selectedType = window.localStorage.getItem(`assetType${props.priority}`)

  const [assetArray, setAssetArray] = useState([])

  useEffect(() => {
    let finalArray = []
    const getArray = () => {
      if (poolFactory.finalLpArray) {
        let tempArray = poolFactory.finalLpArray

        if (props.whiteList) {
          tempArray = tempArray.filter((asset) =>
            props.whiteList.find((item) => item === asset.tokenAddress)
          )
        }

        if (props.blackList) {
          tempArray = tempArray.filter(
            (asset) =>
              props.blackList.find((item) => asset.tokenAddress === item) ===
              undefined
          )
        }

        for (let i = 0; i < tempArray.length; i++) {
          // Add only sparta
          if (props.filter?.includes("sparta")) {
            if (tempArray[i].symbol === "SPARTA") {
              finalArray.push({
                type: "token",
                icon: (
                  <img
                    height="35px"
                    src={spartaIcon}
                    alt={`${tempArray[i].symbol} asset icon`}
                    className="mr-1"
                  />
                ),
                iconUrl: tempArray[i].symbolUrl,
                symbol: tempArray[i].symbol,
                balance: tempArray[i].balanceTokens,
                address: tempArray[i].tokenAddress,
                actualAddr: tempArray[i].tokenAddress
              })
            }
          }

          // Add asset to array
          if (props.filter?.includes("token")) {
            finalArray.push({
              type: "token",
              icon: (
                <img
                  height="35px"
                  src={tempArray[i].symbolUrl}
                  alt={`${tempArray[i].symbol} asset icon`}
                  className="mr-1"
                />
              ),
              iconUrl: tempArray[i].symbolUrl,
              symbol: tempArray[i].symbol,
              balance: tempArray[i].balanceTokens,
              address: tempArray[i].tokenAddress,
              actualAddr: tempArray[i].tokenAddress
            })
          }

          // Add LP token to array
          if (props.filter?.includes("pool")) {
            if (tempArray[i].poolAddress) {
              finalArray.push({
                type: "pool",
                icon: (
                  <>
                    <img
                      height="35px"
                      src={tempArray[i].symbolUrl}
                      alt={`${tempArray[i].symbol} LP token icon`}
                      className="mr-n3"
                    />
                    <img
                      height="20px"
                      src={spartaIcon}
                      alt={`${tempArray[i].symbol} LP token icon`}
                      className="mr-2 mt-3"
                    />
                  </>
                ),
                iconUrl: tempArray[i].symbolUrl,
                symbol: `${tempArray[i].symbol}-SPP`,
                balance: tempArray[i].balanceLPs,
                address: tempArray[i].tokenAddress,
                actualAddr: tempArray[i].poolAddress
              })
            }
          }

          // Add synth to array
          if (props.filter?.includes("synth")) {
            if (tempArray[i].synthAddress) {
              finalArray.push({
                type: "synth",
                iconUrl: tempArray[i].symbolUrl,
                icon: (
                  <>
                    <img
                      height="35px"
                      src={tempArray[i].symbolUrl}
                      alt={`${tempArray[i].symbol} synth icon`}
                      className="mr-n3"
                    />
                    <img
                      height="20px"
                      src={spartaIconAlt}
                      alt={`${tempArray[i].symbol} synth icon`}
                      className="mr-2 mt-3"
                    />
                  </>
                ),
                symbol: `${tempArray[i].symbol}-SPS`,
                balance: tempArray[i].balanceSynths,
                address: tempArray[i].tokenAddress,
                actualAddr: tempArray[i].synthAddress
              })
            }
          }
        }
        if (searchInput?.value) {
          finalArray = finalArray.filter((asset) =>
            asset.symbol
              .toLowerCase()
              .includes(searchInput.value.toLowerCase())
          )
        }
        finalArray = finalArray.sort((a, b) => b.balance - a.balance)
        setAssetArray(finalArray)
      }
    }
    getArray()
  }, [
    poolFactory.finalLpArray,
    props.blackList,
    props.filter,
    props.whiteList,
    searchInput?.value
  ])

  return (
    <>
      <Row
        onClick={() =>
          !props.disabled ? toggleModal() : console.log("button disabled")
        }
        role="button"
        className="justify-content-left"
      >
        <Row className="select-box h-auto" name="singleSelect">
          <Col xs="12">
            {selectedType === "token" && (
              <img
                height="35px"
                src={selectedItem?.symbolUrl}
                alt={`${selectedItem?.symbol}icon`}
                className="mx-2"
              />
            )}

            {selectedType === "pool" && (
              <>
                <img
                  height="35px"
                  src={selectedItem?.symbolUrl}
                  alt={`${selectedItem?.symbol}icon`}
                  className="ml-2 mr-n3"
                />

                <img
                  height="20px"
                  src={spartaIcon}
                  alt="Sparta LP token icon"
                  className="mr-2 mt-3"
                />
              </>
            )}

            {selectedType === "synth" && (
              <>
                <img
                  height="35px"
                  src={selectedItem?.symbolUrl}
                  alt={`${selectedItem?.symbol}icon`}
                  className="ml-2 mr-n3"
                />

                <img
                  height="27px"
                  src={spartaIconAlt}
                  alt="Sparta LP token icon"
                  className="mr-2"
                />
              </>
            )}

            <span className="d-none d-lg-inline-block mr-2">
              {selectedItem && selectedItem?.symbol}
              {selectedType === "pool" && "-SPP"}
              {selectedType === "synth" && "-SPS"}
            </span>

            {!props.disabled && (
              <i className="icon-extra-small icon-arrow icon-light align-middle" />
            )}
          </Col>
          <Col xs="12" className="d-block d-lg-none ml-3">
            {selectedItem && selectedItem?.symbol}
            {selectedType === "pool" && "-SPP"}
            {selectedType === "synth" && "-SPS"}
          </Col>
        </Row>
      </Row>
      <Modal isOpen={showModal} toggle={toggleModal}>
          <Row className="card-body">
            <Col  xs="10">
              <h3 className="ml-2 modal-title">Select an asset</h3>
            </Col>
            <Col xs="2">
              <Button

                onClick={toggleModal}
                className="btn btn-transparent mt-4"
              >
                <i className="icon-small icon-close" />
              </Button>
            </Col>
          </Row>
        <Nav className="nav-tabs-custom card-body" pills>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === 'all',
              })}
              onClick={() => {
                changeTab('all')
              }}
            >
              All
            </NavLink>
          </NavItem>
          {assetArray.filter((asset) => asset.type === 'token').length >
          0 && (
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'token' })}
                onClick={() => {
                  changeTab('token')
                }}
              >
                Tokens
              </NavLink>
            </NavItem>
          )}
          {assetArray.filter((asset) => asset.type === 'pool').length >
          0 && (
            <NavItem>
              <NavLink
                className={classnames({
                  active: activeTab === 'pool',
                })}
                onClick={() => {
                  changeTab('pool')
                }}
              >
                LP Tokens
              </NavLink>
            </NavItem>
          )}
          {assetArray.filter((asset) => asset.type === 'synth').length >
          0 && (
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'synth' })}
                onClick={() => {
                  changeTab('synth')
                }}
              >
                Synths
              </NavLink>
            </NavItem>
          )}
        </Nav>

        <Row className="card-body">
          <Col xs="12" className="m-auto">
            <InputGroup>
              <InputGroupAddon
                addonType="prepend"
                role="button"
                tabIndex={-1}
                onKeyPress={() => clearSearch()}
                onClick={() => clearSearch()}
              >
                <InputGroupText>
                  <i
                    className=""
                    role="button"
                    tabIndex={-1}
                    onKeyPress={() => clearSearch()}
                    onClick={() => clearSearch()}
                  />
                  <i className="icon-search-bar icon-close icon-light ml-n3 mt-1" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-card mt-1"
                placeholder="Search assets..."
                type="text"
                id="searchInput"
                onChange={() => console.log('hello')}
              />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i className="icon-search-bar icon-search icon-light" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Col>
        </Row>
        <div class="modal-body">
          <Row className="mt-n5">
            <Col xs="9" md="9">
              <p className="text-card">Asset</p>
            </Col>
            <Col xs="3" md="3">
              <p className="text-card float-right mr-1">Actions</p>
            </Col>
          </Row>
          {activeTab === 'all' &&
          assetArray.map((asset) => (
            <Row key={asset.symbol} className="mb-3 output-card mr-2">
              <Col xs="4" md="3" className="p-0 pl-2">
                <div
                  role="button"
                  onClick={() => {
                    addSelection(asset)
                    toggleModal()
                  }}
                >
                  {asset.icon}
                </div>
              </Col>

              <Col xs="5" md="5" className="align-items-center p-0">
                <Row>
                  <Col xs="12" className="float-left ml-n4">
                    <div
                      role="button"
                      onClick={() => {
                        addSelection(asset)
                        toggleModal()
                      }}
                    >
                      {asset.symbol}
                    </div>
                    <div className="description">
                      {formatFromWei(asset.balance)}
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col xs="3" md="3" className="text-right p-0 pr-2">
                <Row>
                  <Col xs="6">
                    <ShareLink
                      url={asset.actualAddr}
                      notificationLocation="tc"
                    >
                      <i className="icon-small icon-copy ml-2" />
                    </ShareLink>
                  </Col>
                  <Col xs="6">
                    <div
                      role="button"
                      onClick={() => {
                        dispatch(
                          watchAsset(
                            asset.actualAddr,
                            asset.symbol.includes('-')
                              ? asset.symbol.split('-')[0] +
                              asset.symbol
                                .split('-')[1]
                                .slice(-1)
                                .toLowerCase()
                              : asset.symbol,
                            '18',
                            asset.symbolUrl,
                          ),
                        )
                      }}
                    >
                      <i className="icon-small icon-metamask icon-light ml-2" />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          ))}
          {activeTab !== 'all' &&
          assetArray
            .filter((asset) => asset.type === activeTab)
            .map((asset) => (
              <Row key={asset.symbol} className="mb-3 output-card mr-2">
                <Col xs="4" md="3" className="p-0 pl-2">
                  <div
                    role="button"
                    onClick={() => {
                      addSelection(asset)
                      toggleModal()
                    }}
                  >
                    {asset.icon}
                  </div>
                </Col>

                <Col xs="5" md="5" className="align-items-center p-0">
                  <Row>
                    <Col xs="12" className="float-left ml-n4">
                      <div
                        role="button"
                        onClick={() => {
                          addSelection(asset)
                          toggleModal()
                        }}
                      >
                        {asset.symbol}
                      </div>
                      <div className="description">
                        {formatFromWei(asset.balance)}
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col xs="3" md="3" className="text-right p-0 pr-2">
                  <Row>
                    <Col xs="6">
                      <ShareLink
                        url={asset.actualAddr}
                        notificationLocation="tc"
                      >
                        <i className="icon-small icon-copy ml-2" />
                      </ShareLink>
                    </Col>
                    <Col xs="6">
                      <div
                        role="button"
                        onClick={() => {
                          dispatch(
                            watchAsset(
                              asset.actualAddr,
                              asset.symbol.includes('-')
                                ? asset.symbol.split('-')[0] +
                                asset.symbol
                                  .split('-')[1]
                                  .slice(-1)
                                  .toLowerCase()
                                : asset.symbol,
                              '18',
                              asset.symbolUrl,
                            ),
                          )
                        }}
                      >
                        <i className="icon-small icon-metamask icon-light ml-2" />
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            ))}


        </div>



      </Modal>
    </>
  )
}

export default AssetSelect
