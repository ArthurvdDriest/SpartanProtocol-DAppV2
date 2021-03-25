import * as Types from './types'
import { getPoolFactoryContract } from '../../utils/web3PoolFactory'
import { payloadToDispatch, errorToDispatch } from '../helpers'
import { getUtilsContract } from '../../utils/web3Utils'

export const poolFactoryLoading = () => ({
  type: Types.POOLFACTORY_LOADING,
})

/**
 * Get address of pool via token address
 * @param {address} tokenAddr
 * @returns {address} poolAddr
 */
export const getPoolFactoryPool = (tokenAddr) => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getPoolFactoryContract()

  try {
    const poolAddr = await contract.callStatic.getPool(tokenAddr)
    dispatch(payloadToDispatch(Types.POOLFACTORY_GET_POOL, poolAddr))
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get listed pools count
 * @returns {uint} poolCount
 */
export const getPoolFactoryCount = () => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getPoolFactoryContract()

  try {
    const poolCount = await contract.callStatic.poolCount()
    dispatch(payloadToDispatch(Types.POOLFACTORY_GET_COUNT, poolCount))
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get listed tokens count
 * @returns {uint} tokenCount
 */
export const getPoolFactoryTokenCount = () => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getPoolFactoryContract()

  try {
    const tokenCount = await contract.callStatic.tokenCount()
    dispatch(payloadToDispatch(Types.POOLFACTORY_GET_TOKEN_COUNT, tokenCount))
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get array of all listed token addresses
 * @param {uint} tokenCount
 * @returns {array} tokenArray
 */
export const getPoolFactoryTokenArray = (tokenCount) => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getPoolFactoryContract()

  try {
    const tempArray = []
    for (let i = 0; i < tokenCount; i++) {
      tempArray.push(i)
    }
    const tokenArray = await Promise.all(
      tempArray.map((token) => contract.callStatic.getToken(token)),
    )
    dispatch(payloadToDispatch(Types.POOLFACTORY_GET_TOKEN_ARRAY, tokenArray))
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get curated pools count
 * @returns {uint} curatedPoolCount
 */
export const getPoolFactoryCuratedCount = () => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getPoolFactoryContract()

  try {
    const curatedPoolCount = await contract.callStatic.getCuratedPoolsLength()
    dispatch(
      payloadToDispatch(Types.POOLFACTORY_GET_CURATED_COUNT, curatedPoolCount),
    )
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get array of curated pool addresses
 * @param {uint} curatedPoolCount
 * @returns {array} curatedPoolArray
 */
export const getPoolFactoryCuratedArray = (curatedPoolCount) => async (
  dispatch,
) => {
  dispatch(poolFactoryLoading())
  const contract = getPoolFactoryContract()

  try {
    const tempArray = []
    for (let i = 0; i < curatedPoolCount; i++) {
      tempArray.push(i)
    }
    const curatedPoolArray = await Promise.all(
      tempArray.map((pool) => contract.callStatic.getCuratedPool(pool)),
    )
    dispatch(
      payloadToDispatch(Types.POOLFACTORY_GET_CURATED_ARRAY, curatedPoolArray),
    )
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get array of tokenAddresses grouped with poolAddresses
 * @param {array} tokenArray
 * @returns {array} poolArray
 */
export const getPoolFactoryArray = (tokenArray) => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getPoolFactoryContract()

  try {
    const tempArray = await Promise.all(
      tokenArray.map((token) => contract.callStatic.getPool(token)),
    )
    const poolArray = []
    for (let i = 0; i < tokenArray.length; i++) {
      const tempItem = {
        tokenAddress: tokenArray[i],
        poolAddress: tempArray[i],
      }
      poolArray.push(tempItem)
    }
    dispatch(payloadToDispatch(Types.POOLFACTORY_GET_ARRAY, poolArray))
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get detailed array of token/pool information
 * @param {array} poolArray
 * @returns {array} detailedArray
 */
export const getPoolFactoryDetailedArray = (poolArray) => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getUtilsContract()

  try {
    const tempArray = await Promise.all(
      poolArray.map((i) => contract.callStatic.getTokenDetails(i.tokenAddress)),
    )
    const detailedArray = []
    for (let i = 0; i < poolArray.length; i++) {
      const tempItem = {
        tokenAddress: poolArray[i].tokenAddress,
        poolAddress: poolArray[i].poolAddress,
        name: tempArray[i].name,
        symbol: tempArray[i].symbol,
        decimals: tempArray[i].decimals.toString(),
        totalSupply: tempArray[i].totalSupply.toString(),
        balance: tempArray[i].balance.toString(),
      }
      detailedArray.push(tempItem)
    }
    dispatch(
      payloadToDispatch(Types.POOLFACTORY_GET_DETAILED_ARRAY, detailedArray),
    )
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}

/**
 * Get finalised/useable array of token/pool information
 * @param {array} detailedArray
 * @returns {array} finalArray
 */
export const getPoolFactoryFinalArray = (detailedArray) => async (dispatch) => {
  dispatch(poolFactoryLoading())
  const contract = getUtilsContract()

  try {
    const tempArray = await Promise.all(
      detailedArray.map((i) => contract.callStatic.getPoolData(i.tokenAddress)),
    )
    const finalArray = []
    for (let i = 0; i < detailedArray.length; i++) {
      const tempItem = {
        tokenAddress: detailedArray[i].tokenAddress,
        poolAddress: detailedArray[i].poolAddress,
        name: detailedArray[i].name,
        symbol: detailedArray[i].symbol,
        decimals: detailedArray[i].decimals,
        totalSupply: detailedArray[i].totalSupply,
        balance: detailedArray[i].balance,
        genesis: tempArray[i].genesis.toString(),
        baseAmount: tempArray[i].baseAmount.toString(),
        tokenAmount: tempArray[i].tokenAmount.toString(),
        poolUnits: tempArray[i].poolUnits.toString(),
      }
      finalArray.push(tempItem)
    }
    dispatch(payloadToDispatch(Types.POOLFACTORY_GET_FINAL_ARRAY, finalArray))
  } catch (error) {
    dispatch(errorToDispatch(Types.POOLFACTORY_ERROR, error))
  }
}