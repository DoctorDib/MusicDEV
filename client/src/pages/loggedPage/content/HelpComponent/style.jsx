import styles from '../../../../styles/mainStyle';

export default theme => ({
    ...styles,
    dialogWidth: {
        maxWidth: '90%'
    },
    helperBody: {
        display: 'flex',
        flexDirection: 'row'
    },
    helperContent: {
        overflowY: 'auto',
        width: '100%'
    },
    helperHelp: {
        marginTop: '10px',
        marginBottom: '10px'
    },

    helperHeader: {
        padding: '1em',
        backgroundColor: '#eaeaea',
        borderRadius: '10px 10px 0px 0px'
    },
    helperCard: {
        padding: '1.5em',
        borderRadius: '0px 0px 10px 10px'
    },
    helperImg: {
        width: '50%',
        margin: '1em'
    },
    helperTitle: {
        fontSize: '1.5em',
        marginBottom: '.1em'
    },
    helperSubtitle: {
        fontSize: '1em'
    }
});