import { FC, ReactNode, Suspense } from 'react'
import Backdrop from '@mui/material/Backdrop/index.js';
import CircularProgress from '@mui/material/CircularProgress/index.js';

type WithChildren = {
    children?: ReactNode
}
const SuspensedView: FC<WithChildren> = ({ children }) => {

    return (
        <Suspense fallback={<Backdrop
            sx={{ color: '#fff', zIndex: 1301 }}
            open={true}

        >
            <CircularProgress color="inherit" />
        </Backdrop>}>

            {children}

        </Suspense>
    );
};

export default SuspensedView 