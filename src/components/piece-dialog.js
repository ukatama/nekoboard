import Color from 'color';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import React, {Component, PropTypes} from 'react';

export class PieceDialog extends Component {
    static get propTypes() {
        return {
            open: PropTypes.bool.isRequired,
            onClose: PropTypes.func.isRequired,
            onCreate: PropTypes.func.isRequired,
            shape: PropTypes.string,
            x: PropTypes.number,
            y: PropTypes.number,
            fill: PropTypes.bool,
            fillColor: PropTypes.any,
            stroke: PropTypes.bool,
            strokeColor: PropTypes.any,
            strokeWidth: PropTypes.number,
        };
    }

    get name() {
        return this.ref_name.getValue() || null;
    }

    render() {
        const {
            open,
            shape,
            x, y,
            fill,
            fillColor,
            stroke,
            strokeColor,
            strokeWidth,
            onCreate,
            onClose,
        } = this.props;

        const actions = [
            <FlatButton
                primary
                key="create"
                label="Create"
                onTouchTap={(e) => onCreate(e, {
                    shape,
                    x, y,
                    fill: fill ? Color(fillColor).rgbString() : 'none',
                    stroke: stroke ? Color(strokeColor).rgbString() : 'none',
                    strokeWidth,
                    name: this.name,
                })}
            />,
            <FlatButton
                secondary
                key="cancel"
                label="Cancel"
                onTouchTap={onClose}
            />,
        ];

        return (
            <Dialog
                actions={actions}
                open={open}
                title="Piece"
                onRequestClose={onClose}
            >
                <TextField
                    fullWidth
                    floatingLabelText="name"
                    name="name"
                    ref={(c) => (this.ref_name = c)}
                />
            </Dialog>
        );
    }
}