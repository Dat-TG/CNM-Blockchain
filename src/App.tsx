import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import Pages from '@/routes/Pages';
import Header from '@/sections/Header';
import HotKeys from '@/sections/HotKeys';
import Notifications from '@/sections/Notifications';
import SW from '@/sections/SW';
import Sidebar from '@/sections/Sidebar';
import CssBaseline from '@mui/material/CssBaseline';
import { PolygonAmoyTestnet } from '@thirdweb-dev/chains';
import {
	ThirdwebProvider,
	coinbaseWallet,
	metamaskWallet,
	walletConnect,
} from '@thirdweb-dev/react';
import { Fragment } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Footer from './sections/Footer';

function App() {
	return (
		<ThirdwebProvider
			activeChain={PolygonAmoyTestnet}
			clientId="4b769b84ce03e52e2df9972a6f135097"
			supportedWallets={[
				metamaskWallet({
					recommended: true,
				}),
				coinbaseWallet(),
				walletConnect(),
			]}
		>
			<Fragment>
				<CssBaseline />
				<Notifications />
				<HotKeys />
				<SW />
				<BrowserRouter>
					<Header />
					<Sidebar />
					<Pages />
					<Footer />
				</BrowserRouter>
			</Fragment>
		</ThirdwebProvider>
	);
}

export default withErrorHandler(App, AppErrorBoundaryFallback);
