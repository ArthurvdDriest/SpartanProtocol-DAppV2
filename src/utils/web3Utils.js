import { BN } from './bigNumber'

export const one = BN(1).times(10).pow(18)

// ************** CORE MATHEMATICS (USE THESE IN UI WHERE NEAR-INSTANT-RETURN IS REQUIRED) ************** //

// /////////////////////////////// UTILS FUNCTIONS ////////////////////////////////////////////////////

/**
 * Calculate basis points (10,000 basis points = 100.00%)
 * @param {uint} input
 * @param {uint} balance
 * @returns {uint} part
 */
export const calcBasisPoints = (input, balance) => {
  const part1 = BN(input).div(BN(balance))
  const part = part1.times('10000')
  return part
}

// Calculate share | share = amount * part/total
export const calcShare = (part, total, amount) => {
  const _part = BN(part)
  const _total = BN(total)
  const _amount = BN(amount)
  const result = _amount.times(_part).div(_total)
  return result
}

/**
 * Calculate Part (10,000 basis points = 100.00%)
 * @param {uint} bp
 * @param {uint} total
 * @returns {uint} part
 */
export const calcPart = (bp, total) => {
  let part = 0
  if (bp <= 10000 && bp > 0) {
    part = calcShare(bp, 10000, total)
  } else console.log('Must be valid basis points')
  return part
}

export const getPoolShareWeight = (units, totalSupply, totalAmount) => {
  const _units = BN(units)
  const _totalSupply = BN(totalSupply)
  const _totalAmount = BN(totalAmount)
  const weight = calcShare(_units, _totalSupply, _totalAmount)
  return weight
}

export const getPool = (tokenAddr, poolDetails) =>
  poolDetails.filter((i) => i.tokenAddress === tokenAddr)[0]

export const getSynth = (tokenAddr, synthDetails) =>
  synthDetails.filter((i) => i.tokenAddress === tokenAddr)[0]

// Get spot value of tokens in base
export const calcSpotValueInBase = (inputAmount, poolDetails) => {
  const _input = BN(inputAmount)
  const _spartaDepth = BN(poolDetails.baseAmount)
  const _tokenDepth = BN(poolDetails.tokenAmount)
  const result = _input.times(_spartaDepth).div(_tokenDepth)
  return result
}

// Get spot value of sparta in token
export const calcSpotValueInToken = (inputAmount, poolDetails) => {
  const _input = BN(inputAmount)
  const _spartaDepth = BN(poolDetails.baseAmount)
  const _tokenDepth = BN(poolDetails.tokenAmount)
  const result = _input.times(_tokenDepth).div(_spartaDepth)
  return result
}

// Get spot value of synths in base? For realise() function calc
export const calcSynthSpotValueInBase = (inputAmount, poolDetails) => {
  const _input = BN(inputAmount)
  const _spartaDepth = BN(poolDetails.baseAmount)
  const _tokenDepth = BN(poolDetails.tokenAmount)
  const numerator = _input.times(_spartaDepth)
  const denominator = _tokenDepth.times(2)
  const result = numerator.div(denominator)
  return result
}

export const calcSlipAdjustment = (spartaInput, tokenInput, poolDetails) => {
  const b = BN(spartaInput)
  const B = BN(poolDetails.baseAmount)
  const t = BN(tokenInput)
  const T = BN(poolDetails.tokenAmount)
  const part1 = B.times(t) // baseDepth * tokenInput
  const part2 = b.times(T) // baseInput * tokenDepth
  const part3 = b.times(2).plus(B) // 2 * baseInput + baseDepth (Modified to reduce slip adjustment)
  const part4 = t.plus(T) // tokenInput + tokenDepth
  let numerator = ''
  if (part1.isGreaterThan(part2)) {
    numerator = part1.minus(part2)
  } else {
    numerator = part2.minus(part1)
  }
  const denominator = part3.times(part4)
  return one.minus(numerator.times(one).div(denominator)).toFixed(0, 1)
}

// Calculate liquidity units
export const calcLiquidityUnits = (spartaInput, tokenInput, poolDetails) => {
  const b = BN(spartaInput)
  const B = BN(poolDetails.baseAmount)
  const t = BN(tokenInput)
  const T = BN(poolDetails.tokenAmount)
  const P = BN(poolDetails.poolUnits)
  if (P <= 0) {
    return b
  }
  const slipAdjustment = calcSlipAdjustment(
    spartaInput,
    tokenInput,
    poolDetails,
  )
  const part1 = t.times(B) // tokenInput * baseDepth
  const part2 = T.times(b) // tokenDepth * baseInput
  const part3 = T.times(B).times(2) // tokenDepth * baseDepth * 2
  const part4 = P.times(part1.plus(part2)).div(part3) // P == totalSupply
  const result = BN(part4).times(slipAdjustment).div(one)
  return result.toFixed(0, 1)
}

/**
 * Calculate redemption value of LP tokens
 * @param inputLP uint - amount of LP TOKENS being calculated from (input)
 * @param poolDetails pool item from poolDetails object
 * @returns [spartaValue, tokenValue]
 */
export const calcLiquidityHoldings = (inputLP, poolDetails) => {
  const _inputLP = BN(inputLP)
  const _spartaDepth = BN(poolDetails.baseAmount)
  const _tokenDepth = BN(poolDetails.tokenAmount)
  const _totalSupply = BN(poolDetails.poolUnits)
  const spartaValue = _spartaDepth.times(_inputLP).div(_totalSupply)
  const tokenValue = _tokenDepth.times(_inputLP).div(_totalSupply)
  return [spartaValue, tokenValue]
}

/**
 * calcSwapOutput inc fee
 * @param inputAmount
 * @param poolDetails
 * @param toBase
 * @returns [swapOutput, swapFee]
 */
export const calcSwapOutput = (inputAmount, poolDetails, toBase) => {
  const x = BN(inputAmount) // Input amount
  const X = toBase ? BN(poolDetails.tokenAmount) : BN(poolDetails.baseAmount) // if toBase; tokenAmount
  const Y = toBase ? BN(poolDetails.baseAmount) : BN(poolDetails.tokenAmount) // if toBase; baseAmount
  const swapNumerator = x.times(X).times(Y)
  const swapDenominator = x.plus(X).times(x.plus(X))
  const swapOutput = swapNumerator.div(swapDenominator)
  const feeNumerator = x.times(x).times(Y)
  const feeDenominator = x.plus(X).times(x.plus(X))
  const swapFee = feeNumerator.div(feeDenominator)
  const swapFeeInBase = toBase
    ? calcSpotValueInBase(swapFee, poolDetails)
    : swapFee
  return [swapOutput, swapFeeInBase]
}

// Calculate swap fee
export const calcSwapFee = (inputAmount, poolDetails, toBase) => {
  const x = BN(inputAmount) // Input amount
  const X = toBase ? BN(poolDetails.tokenAmount) : BN(poolDetails.baseAmount) // if toBase; tokenAmount
  const Y = toBase ? BN(poolDetails.baseAmount) : BN(poolDetails.tokenAmount) // if toBase; baseAmount
  const numerator = x.times(x).times(Y)
  const denominator = x.plus(X).times(x.plus(X))
  const result = numerator.div(denominator)
  return result
}

// LP Units minted from forged Synth
export const calcLiquidityUnitsAsym = (inputAmount, poolDetails) => {
  const _input = BN(inputAmount)
  const _spartaDepth = BN(poolDetails.baseAmount)
  const _totalSupply = BN(poolDetails.poolUnits)
  const numerator = _totalSupply.times(_input)
  const denominator = _input.plus(_spartaDepth).times(2)
  const result = numerator.div(denominator)
  return result
}

// ///////////////// OTHERS ////////////////////////

// Calculate asymmetric share
export const calcAsymmetricShare = (input, pool, toBase) => {
  // share = (u * U * (2 * A^2 - 2 * U * u + U^2))/U^3
  // (part1 * (part2 - part3 + part4)) / part5
  const u = BN(input) // UNITS (SPARTA == toToken || TOKEN == toBase)
  const U = BN(pool.poolUnits) // TOTAL SUPPLY OF LP TOKEN
  const A = toBase ? BN(pool.baseAmount) : BN(pool.tokenAmount) // TOKEN IN POOL (if !toBase) || SPARTA IN POOL (if toBase)
  const part1 = u.times(A)
  const part2 = U.times(U).times(2)
  const part3 = U.times(u).times(2)
  const part4 = u.times(u)
  const numerator = part1.times(part2.minus(part3).plus(part4))
  const part5 = U.times(U).times(U)
  const result = numerator.div(part5)
  return result
}

// Calculate liquidity share
export const calcLiquidityShare = (input, pool) => {
  // share = amount * part/total
  const _input = BN(input)
  const amount = BN(pool.tokenAmount)
  const totalSupply = BN(pool.poolUnits)
  const result = amount.times(_input).div(totalSupply)
  return result
}

/**
 * Calculate feeBurn basis points (0 - 100 ie. 0% to 1%)
 * Uses the feeOnTransfer if already called
 * @param {uint} feeOnTransfer
 * @param {uint} amount
 * @returns {uint} fee
 */
export const calcFeeBurn = (feeOnTransfer, amount) => {
  const fee = calcPart(feeOnTransfer, amount)
  return fee
}

/**
 * Return SPARTA after feeBurn
 * @param {uint} amount
 * @param {uint} feeOnTsf
 * @returns {uint} fee
 */
export const minusFeeBurn = (amount, feeOnTsf) => {
  const _amount = BN(amount)
  const burnFee = calcFeeBurn(feeOnTsf, _amount)
  const afterFeeBurn = _amount.minus(burnFee)
  return afterFeeBurn
}

/**
 * Calculate value of synthetic assets
 * @param amount uint - amount of synths?
 * @param tokensInPool uint - amount of TOKENS held by the pool
 * @param spartaInPool uint - amount of SPARTA held by the pool
 * @param poolTotalSupply uint - total supply of LP tokens
 * @returns {uint} share
 */
export const calcSynthsValue = (
  amount,
  tokensInPool,
  spartaInPool,
  poolTotalSupply,
) => {
  const amountHalved = BN(amount).div(2) // AMOUNT HALVED
  const spartaSwapValue = calcSwapOutput(
    amountHalved,
    tokensInPool,
    spartaInPool,
    true,
  )[0] // BASE SWAPPED VALUE
  const units = calcLiquidityUnits(
    spartaSwapValue,
    spartaInPool,
    amountHalved,
    tokensInPool,
    poolTotalSupply,
  )
  console.log(units.toFixed())
  return units
}

// Calculate double-swap fee
export const calcDoubleSwapFee = (inputAmount, pool1, pool2) => {
  // formula: getSwapFee1 + getSwapFee2
  const fee1 = calcSwapFee(
    inputAmount,
    pool1.tokenAmount,
    pool1.baseAmount,
    true,
  ) // Fee in SPARTA
  const x = calcSwapOutput(
    inputAmount,
    pool1.tokenAmount,
    pool1.baseAmount,
    true,
  ) // Output in SPARTA
  const fee2 = calcSwapFee(x[0], pool2.tokenAmount, pool2.baseAmount, false) // Fee in targetToken
  const fee2Sparta = calcSpotValueInBase(fee2, pool2) // targetToken fee converted to SPARTA
  const result = fee1.plus(fee2Sparta) // Total fee in SPARTA
  return result
}

// Calculate double-swap output
export const calcDoubleSwapOutput = (
  inputAmount,
  pool1Token,
  pool1Sparta,
  pool2Token,
  pool2Sparta,
) => {
  // formula: calcSwapOutput(pool1) => calcSwapOutput(pool2)
  const x = calcSwapOutput(inputAmount, pool1Token, pool1Sparta, true)
  const output = calcSwapOutput(x[0], pool2Token, pool2Sparta, false)
  return output[0]
}

// Calculate swap slippage
export const calcSwapSlip = (inputAmount, pool, toBase) => {
  // formula: (x) / (x + X)
  const x = BN(inputAmount) // input amount
  const X = toBase ? BN(pool.tokenAmount) : BN(pool.baseAmount) // if toBase; tokenAmount
  const result = x.div(x.plus(X))
  console.log(result.toFixed())
  return result
}

// Calculate double-swap slippage
export const calcDoubleSwapSlip = (inputAmount, pool1, pool2) => {
  // formula: getSwapSlip1(input1) + getSwapSlip2(getSwapOutput1 => input2)
  const swapSlip1 = calcSwapSlip(inputAmount, pool1, true)
  const x = calcSwapOutput(inputAmount, pool1, true)
  const swapSlip2 = calcSwapSlip(x[0], pool2, false)
  const result = swapSlip1.plus(swapSlip2)
  console.log(result.toFixed())
  return result
}

// Calculate swap input
export const getSwapInput = (outputAmount, tokenAmount, baseAmount, toBase) => {
  // formula: (((X*Y)/y - 2*X) - sqrt(((X*Y)/y - 2*X)^2 - 4*X^2))/2
  // (part1 - sqrt(part1 - part2))/2
  const y = BN(outputAmount) // Output amount
  const X = toBase ? BN(tokenAmount) : BN(baseAmount) // if toBase; tokenAmount
  const Y = toBase ? BN(baseAmount) : BN(tokenAmount) // if toBase; baseAmount
  const part1 = X.times(Y).div(y).minus(X.times(2))
  const part2 = X.pow(2).times(4)
  const result = part1.minus(part1.pow(2).minus(part2).sqrt()).div(2)
  return result
}

// Calculate double-swap input
export const calcDoubleSwapInput = (
  outputAmount,
  pool1Token,
  pool1Sparta,
  pool2Token,
  pool2Sparta,
) => {
  // formula: calcSwapOutput(pool1) => calcSwapOutput(pool2)
  const x = getSwapInput(outputAmount, pool1Token, pool1Sparta, true)
  const output = getSwapInput(x, pool2Token, pool2Sparta, false)
  return output
}

/**
 * Calculate APY using full month divis + fees and pool's depth
 * @param {uint} recentDivis
 * @param {uint} lastMonthDivis
 * @param {uint} recentFees
 * @param {uint} lastMonthFees
 * @param {uint} poolGenesis
 * @param {uint} poolBaseDepth
 * @returns {uint} apy
 */
export const calcAPY = (
  recentDivis,
  lastMonthDivis,
  recentFees,
  lastMonthFees,
  poolGenesis,
  poolBaseDepth,
) => {
  let apy = '0'
  const actualDepth = BN(poolBaseDepth).times(2)
  const monthFraction = ((Date.now() / 1000).toFixed() - poolGenesis) / 2592000
  if (monthFraction > 1) {
    apy = BN(lastMonthDivis > 0 ? lastMonthDivis : recentDivis)
      .plus(lastMonthFees > 0 ? lastMonthFees : recentFees)
      .times(12)
      .div(actualDepth)
      .times(100)
  } else {
    apy = BN(recentDivis)
      .plus(recentFees)
      .times(12 / monthFraction)
      .div(actualDepth)
      .times(100)
  }
  return apy
}
