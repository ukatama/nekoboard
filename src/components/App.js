import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import * as Colors from 'material-ui/styles/colors';
import ThemeManager from 'material-ui/styles/themeManager';
import React, { Component, PropTypes } from 'react';
import Theme from '../browser/theme';
import { Canvas } from '../containers/Canvas';
import { BoardConfigDialog } from '../containers/BoardConfigDialog';
import { EditStyleDialog } from '../containers/EditStyleDialog';
import { EditTextDialog } from '../containers/EditTextDialog';
import { PieceDialog } from '../containers/piece-dialog';
import { Toolbar } from '../containers/Toolbar';

const Style = {
    Container: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: Colors.grey300,
        height: '100%',
    },
    CanvasContainer: {
        flex: '1 1 auto',
        perspective: '10000px',
        textAlign: 'center',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
    },
};

export class App extends Component {
    static get childContextTypes() {
        return {
            muiTheme: PropTypes.object,
        };
    }
    static get propTypes() {
        return {
            title: PropTypes.string,
            onLoad: PropTypes.func,
            onOpenConfig: PropTypes.func,
            onSave: PropTypes.func,
            onExportSVG: PropTypes.func,
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            leftNav: false,
        };
    }

    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(Theme),
        };
    }

    handleLeftNavItem(handler) {
        this.setState({ leftNav: false });
        if (handler) handler();
    }

    render() {
        const {
            title,
            onOpenConfig,
            onLoad,
            onSave,
            onExportSVG,
        } = this.props;
        const { leftNav } = this.state;

        document.title = title
            ? `${title} - Nekoboard`
            : 'Nekoboard';

        return (
            <div style={Style.Container}>
                <AppBar
                    showMenuIconButton
                    iconElementRight={
                        <IconButton
                            iconClassName="material-icons"
                            iconStyle={{ color: 'white' }}
                            onTouchTap={onOpenConfig}
                        >
                            settings
                        </IconButton>
                    }
                    title={title || 'Nekoboard'}
                    onLeftIconButtonTouchTap={
                        () => this.setState({ leftNav: !leftNav })
                    }
                />
                <Drawer
                    docked={false}
                    open={leftNav}
                    onRequestChange={(open) => this.setState({ leftNav: open })}
                >
                    <MenuItem
                        onTouchTap={() => this.handleLeftNavItem(onLoad)}
                    >
                        Load
                    </MenuItem>
                    <MenuItem
                        onTouchTap={() => this.handleLeftNavItem(onSave)}
                    >
                        Save
                    </MenuItem>
                    <MenuItem
                        onTouchTap={() => this.handleLeftNavItem(onExportSVG)}
                    >
                        Export SVG
                    </MenuItem>
                </Drawer>
                <div style={Style.CanvasContainer}>
                    <Canvas />
                </div>
                <Toolbar style={{ flex: '0 0 auto' }} />
                <BoardConfigDialog />
                <EditStyleDialog />
                <EditTextDialog />
                <PieceDialog />
            </div>
        );
    }
}
