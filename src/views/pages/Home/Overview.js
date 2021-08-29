import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { Card, Col, Nav, Row } from 'react-bootstrap'
import PoolItem from './PoolItem'
import { usePool } from '../../../store/pool'
import { getNetwork } from '../../../utils/web3'
import HelmetLoading from '../../../components/Loaders/HelmetLoading'
import { allListedAssets } from '../../../store/bond/actions'
import WrongNetwork from '../../../components/Common/WrongNetwork'
import SummaryItem from './SummaryItem'

const Overview = () => {
  const dispatch = useDispatch()
  const wallet = useWallet()
  const { t } = useTranslation()
  const pool = usePool()

  const [activeTab, setActiveTab] = useState('1')

  const [network, setnetwork] = useState(getNetwork())
  const [trigger0, settrigger0] = useState(0)
  const getData = () => {
    setnetwork(getNetwork())
  }
  useEffect(() => {
    if (trigger0 === 0) {
      getData()
    }
    const timer = setTimeout(() => {
      getData()
      settrigger0(trigger0 + 1)
    }, 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger0])

  const [trigger1, settrigger1] = useState(0)
  useEffect(() => {
    if (trigger1 === 0 && network.chainId === 97) {
      dispatch(allListedAssets(wallet))
    }
    const timer = setTimeout(() => {
      if (network.chainId === 97) {
        dispatch(allListedAssets(wallet))
        settrigger1(trigger1 + 1)
      }
    }, 10000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger1])

  return (
    <>
      <div className="content">
        {network.chainId === 97 && (
          <>
            <Row className="row-480">
              <Col xs="12">
                <SummaryItem />
                <Card>
                  <Card.Header className="p-0 border-0 mb-2 rounded-pill-top-left">
                    <Nav activeKey={activeTab} fill>
                      <Nav.Item key="1" className="rounded-pill-top-left">
                        <Nav.Link
                          eventKey="1"
                          className="rounded-pill-top-left"
                          onClick={() => {
                            setActiveTab('1')
                          }}
                        >
                          {t('curated')}
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item key="2">
                        <Nav.Link
                          eventKey="2"
                          onClick={() => {
                            setActiveTab('2')
                          }}
                        >
                          {t('standard')}
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item key="3" className="rounded-pill-top-right">
                        <Nav.Link
                          className="rounded-pill-top-right"
                          eventKey="3"
                          onClick={() => {
                            setActiveTab('3')
                          }}
                        >
                          {t('new')}
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {activeTab === '1' &&
                        pool?.poolDetails
                          .filter(
                            (asset) =>
                              asset.baseAmount > 0 &&
                              asset.curated === true &&
                              asset.newPool === false,
                          )
                          .sort((a, b) => b.baseAmount - a.baseAmount)
                          .map((asset) => (
                            <PoolItem key={asset.address} asset={asset} />
                          ))}
                      {activeTab === '2' &&
                        pool?.poolDetails
                          .filter(
                            (asset) =>
                              asset.baseAmount > 0 &&
                              asset.curated === false &&
                              asset.newPool === false,
                          )
                          .sort((a, b) => b.baseAmount - a.baseAmount)
                          .map((asset) => (
                            <PoolItem key={asset.address} asset={asset} />
                          ))}
                      {activeTab === '3' &&
                        pool?.poolDetails
                          .filter(
                            (asset) =>
                              asset.baseAmount > 0 && asset.newPool === true,
                          )
                          .sort((a, b) => b.baseAmount - a.baseAmount)
                          .map((asset) => (
                            <PoolItem key={asset.address} asset={asset} />
                          ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {pool.poolDetails.length <= 0 && (
                <Col className="card-480">
                  <HelmetLoading height={300} width={300} />
                </Col>
              )}
            </Row>
          </>
        )}
        {network.chainId !== 97 && <WrongNetwork />}
      </div>
    </>
  )
}

export default Overview
