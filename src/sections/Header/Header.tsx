import { FlexBox } from '@/components/styled';
import { repository, title } from '@/config';
// import useHotKeysDialog from '@/store/hotkeys';
import useSidebar from '@/store/sidebar';
import useTheme from '@/store/theme';
import GitHubIcon from '@mui/icons-material/GitHub';
import ThemeIcon from '@mui/icons-material/InvertColors';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import WalletConnectButton from './ConnectWalletButton';
import LanguageMenu from './LanguageMenu';
// import { HotKeysButton } from './styled';

function Header() {
	const [, sidebarActions] = useSidebar();
	const [theme, themeActions] = useTheme();
	// const [, hotKeysDialogActions] = useHotKeysDialog();
	const navigate = useNavigate();

	const { t } = useTranslation('global');

	return (
		<Box data-pw={`theme-${theme}`} sx={{ flexGrow: 1 }}>
			<AppBar color="transparent" elevation={1} position="static">
				<Toolbar sx={{ justifyContent: 'space-between' }}>
					<FlexBox sx={{ alignItems: 'center' }}>
						<IconButton
							aria-label="menu"
							color="primary"
							edge="start"
							onClick={sidebarActions.toggle}
							size="large"
							sx={{ mr: 1 }}
						>
							<MenuIcon />
						</IconButton>
						<Button
							color="primary"
							onClick={() => navigate('/')}
							sx={{
								textTransform: 'uppercase',
							}}
						>
							{title}
						</Button>
					</FlexBox>
					<FlexBox>
						<FlexBox>
							<Tooltip arrow title="About us">
								{/* <HotKeysButton
									aria-label="open hotkeys dialog"
									onClick={hotKeysDialogActions.open}
									size="small"
									variant="outlined"
								>
									alt + k
								</HotKeysButton> */}
								<Button color="primary" onClick={() => navigate('/about')}>
									{t('aboutUs')}
								</Button>
							</Tooltip>
						</FlexBox>
						<Divider flexItem orientation="vertical" />
						<Tooltip arrow title="Github Repo">
							<IconButton
								color="primary"
								component="a"
								href={repository}
								size="large"
								target="_blank"
							>
								<GitHubIcon />
							</IconButton>
						</Tooltip>
						<Divider flexItem orientation="vertical" />
						<LanguageMenu />
						<Divider flexItem orientation="vertical" />
						<Tooltip arrow title="Switch theme">
							<IconButton
								color="primary"
								data-pw="theme-toggle"
								edge="end"
								onClick={themeActions.toggle}
								size="large"
								sx={{
									marginX: 'auto',
								}}
							>
								<ThemeIcon />
							</IconButton>
						</Tooltip>
						<Divider flexItem orientation="vertical" />
						<WalletConnectButton />
					</FlexBox>
				</Toolbar>
			</AppBar>
		</Box>
	);
}

export default Header;
