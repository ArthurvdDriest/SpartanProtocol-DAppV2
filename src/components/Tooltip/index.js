import React from 'react'
import Popover from 'react-bootstrap/Popover'

/**
 * Get the custom tooltip from imported list.
 * @param {string} tooltip id of the icon requested (required)
 * @param {string} variable value of a custom variable if included (optional)
 * @returns {Component} Custom Tooltip
 */
export const Tooltip = (t, tooltipId, variable) => {
  const allTooltips = [
    {
      id: 'apy',
      title: 'APY',
      body: 'apyInfo',
    },
    {
      id: 'apyPool',
      title: 'poolApy',
      body: 'apyPoolInfo',
    },
    {
      id: 'apyVault',
      title: 'vaultApy',
      body: 'apyVaultInfo',
    },
    {
      id: 'apySynth',
      title: 'vaultApy',
      body: 'vaultApyInfo',
    },
    {
      id: 'bond',
      title: 'bond',
      body: 'bondInfo',
    },
    {
      id: 'daoVaultWeight',
      title: 'daoVaultWeight',
      body: 'daoVaultWeightInfo',
    },
    {
      id: 'daoHarvestable',
      title: 'daoHarvestable',
      body: 'daoHarvestableInfo',
    },
    {
      id: 'dividendRevenue',
      title: 'dividendRevenueTitle',
      body: 'dividendRevenue',
      variable: { days: variable },
    },
    {
      id: 'gasRate',
      title: 'gasRate',
      body: 'gasRateDesc',
    },
    {
      id: 'hiddenPools',
      title: 'hiddenPools',
      body: 'hiddenPoolsInfo',
    },
    {
      id: 'incentivesRevenue',
      title: 'incentiveRevenue',
      body: 'incentiveRevenueDesc',
      variable: { days: variable },
    },
    {
      id: 'newPool',
      title: 'poolInitializing',
      body: 'newPoolInfo',
      variable: { pool: variable },
    },
    {
      id: 'newPoolRatio',
      title: 'newPoolRatioTitle',
      body: 'newPoolRatio',
    },
    {
      id: 'poolActive',
      title: 'poolActive',
      body: 'poolActiveInfo',
      variable: { pool: variable },
    },
    {
      id: 'newPoolFee',
      title: 'newPoolFeeTitle',
      body: 'newPoolFee',
    },
    {
      id: 'newProposalFee',
      title: 'newProposalFee',
      body: 'newProposalFeeInfo',
    },
    {
      id: 'poolCap',
      title: 'poolCap',
      body: 'poolCapInfo',
    },
    {
      id: 'poolCurated',
      title: 'poolCurated',
      body: 'poolCuratedInfo',
      variable: { pool: variable },
    },
    {
      id: 'poolInactive',
      title: 'poolInactive',
      body: 'poolInactiveInfo',
      variable: { pool: variable },
    },
    {
      id: 'poolNormal',
      title: 'poolNormal',
      body: 'poolNormalInfo',
      variable: { pool: variable },
    },
    {
      id: 'poolRatio',
      title: 'poolRatio',
      body: 'poolRatioInfo',
    },
    {
      id: 'pricingData',
      body: 'pricingDataProvided',
      variable: { provider: variable },
    },
    {
      id: 'rank',
      title: 'rank',
      body: 'rankInfo',
    },
    {
      id: 'revenue',
      title: 'revenue',
      body: 'revenueInfo',
      variable: { days: variable },
    },
    {
      id: 'slipInfo',
      title: 'slip',
      body: 'slipInfo',
    },
    {
      id: 'slipTolerance',
      title: 'slipTolerance',
      body: 'slipToleranceDesc',
    },
    {
      id: 'swapRevenue',
      title: 'swapRevenueTitle',
      body: 'swapRevenue',
      variable: { days: variable },
    },
    {
      id: 'swapRevInfo',
      title: 'revenue',
      body: 'swapRevInfo',
    },
    {
      id: 'synthCap',
      title: 'synthCap',
      body: 'synthCapInfo',
    },
    {
      id: 'synthPC',
      title: 'synthPC',
      body: 'synthPCInfo',
    },
    {
      id: 'synthUR',
      title: 'unrealised',
      body: 'synthURInfo',
    },
    {
      id: 'synthView',
      title: 'synthViewTitle',
      body: 'synthViewInfo',
    },
    {
      id: 'yourForge',
      title: 'yourForge',
      body: 'yourForgeInfo',
    },
    {
      id: 'mintSynthConfirm',
      title: 'warning',
      body: 'mintSynthConfirm',
    },
    {
      id: 'mintHarvestConfirm',
      title: 'warning',
      body: 'mintHarvestConfirm',
      variable: { symbol: variable },
    },
  ]

  const tooltip = allTooltips.filter((i) => i.id === tooltipId)[0]
  const title = tooltip ? tooltip.title : false
  const body = tooltip ? t(tooltip.body, tooltip.variable) : tooltipId

  return (
    <Popover>
      {title && <Popover.Header as="h3">{t(title)}</Popover.Header>}
      <Popover.Body>{body}</Popover.Body>
    </Popover>
  )
}
