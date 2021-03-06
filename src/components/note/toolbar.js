'use strict'

const React = require('react')
const { PropTypes } = require('prop-types')
const { FormattedMessage } = require('react-intl')
const { Toolbar, ToolGroup } = require('../toolbar')
const { IconNote, IconPlus } = require('../icons')
const { IconButton } = require('../button')


const NoteToolbar = ({ hasCreateButton, onCreate }) => (
  <Toolbar isDraggable={false}>
    <div className="toolbar-left">
      <IconNote/>
      <h4><FormattedMessage id="panel.notes"/></h4>
    </div>

    <div className="toolbar-right">
      {
        hasCreateButton &&
          <ToolGroup>
            <IconButton icon={<IconPlus/>} onClick={onCreate}/>
          </ToolGroup>
      }
    </div>
  </Toolbar>
)

NoteToolbar.propTypes = {
  hasCreateButton: PropTypes.bool,
  onCreate: PropTypes.func
}


module.exports = {
  NoteToolbar
}

