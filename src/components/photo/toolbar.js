'use strict'

const React = require('react')
const { PropTypes } = React
const { FormattedMessage } = require('react-intl')
const { Toolbar, ToolGroup } = require('../toolbar')
const { Slider } = require('../slider')

const {
  IconPhoto, IconPlus, IconListSmall, IconGridSmall
} = require('../icons')


const PhotoToolbar = ({
  hasCreateButton, onCreate, zoom, maxZoom, onZoomChange
}) => (
  <Toolbar>
    <div className="toolbar-left">
      <IconPhoto/>
      <h4><FormattedMessage id="panel.photos"/></h4>
    </div>

    <div className="toolbar-right">
      {
        hasCreateButton &&
          <ToolGroup>
            <button className="btn btn-icon" onClick={onCreate}>
              <IconPlus/>
            </button>
          </ToolGroup>
      }
      <ToolGroup>
        <Slider
          value={zoom}
          max={maxZoom}
          size="sm"
          minIcon={<IconListSmall/>}
          maxIcon={<IconGridSmall/>}
          onChange={onZoomChange}/>
      </ToolGroup>
    </div>
  </Toolbar>
)

PhotoToolbar.propTypes = {
  maxZoom: PropTypes.number,
  zoom: PropTypes.number,
  hasCreateButton: PropTypes.bool,
  onCreate: PropTypes.func,
  onZoomChange: PropTypes.func
}

PhotoToolbar.defaultProps = {
  maxZoom: 5
}

module.exports = {
  PhotoToolbar
}