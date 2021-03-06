describe('View reducer', () => {
    jest.autoMockOff();
    const View = require('../../actions/view');
    const view = require('../view').view;

    let state;
    it('sets initial state', () => {
        state = view(state, { type: 'INIT' });
        expect(state).toEqual({
            perspective: false,
            zoom: 1,
        });
    });

    it('zooms in', () => {
        state = view(state, View.zoomIn());
        expect(state).toEqual({
            perspective: false,
            zoom: 1.1,
        });
    });

    it('resets zoom', () => {
        state = view(state, View.resetZoom());
        expect(state).toEqual({
            perspective: false,
            zoom: 1.0,
        });
    });

    it('zooms out', () => {
        state = view(state, View.zoomOut());
        expect(state).toEqual({
            perspective: false,
            zoom: 1.0 / 1.1,
        });
    });


    it('sets perspective', () => {
        state = view(state, View.perspective(true));
        expect(state).toEqual({
            perspective: true,
            zoom: 1.0 / 1.1,
        });

        state = view(state, View.perspective(false));
        expect(state).toEqual({
            perspective: false,
            zoom: 1.0 / 1.1,
        });
    });
});
