import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import { buildSidebarNavigation } from '../services/sidebarService'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const company = useSelector((state) => state.company)
  const navigationTree = useSelector((state) => state.navigation)
  const navigation = useMemo(() => buildSidebarNavigation(navigationTree), [navigationTree])

  return (
    <CSidebar
      className="border-end"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/" className="sidebar-brand text-decoration-none">
          {company?.comp_logo ? (
            <img
              src={company.comp_logo}
              alt={company?.comp_name || 'Niskala'}
              height="32"
              className="sidebar-brand-img"
            />
          ) : (
            <div className="sidebar-brand-wordmark">
              <span className="sidebar-brand-mark">◈</span>
              <span className="sidebar-brand-text">{company?.comp_name || 'Niskala'}</span>
            </div>
          )}
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      <AppSidebarNav items={navigation} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
