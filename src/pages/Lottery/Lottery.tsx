import Meta from '@/components/Meta';
import { currency } from '@/constants';
import useNotifications from '@/store/notifications';
import StarIcon from '@mui/icons-material/Star';
import {
	Box,
	Button,
	Container,
	Grid,
	InputAdornment,
	Paper,
	TextField,
	Typography,
	keyframes,
} from '@mui/material';
import { useAddress, useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoginPrompt from '../LoginPrompt';
import AdminControls from './AdminControl';
import CountdownTimer from './CountdownTimer';
import Loading from './Loading';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(20px);
  }
  to {
    transform: translateY(0);
  }
`;

const Lottery: React.FC = () => {
	const address = useAddress();
	const [userTicket, setUserTicket] = useState(0);
	const [quantity, setQuantity] = useState<number>(1);
	const { contract, isLoading } = useContract(
		import.meta.env.VITE_LOTTERY_CONTRACT_ADDRESS as string,
	);
	const { data: remainingTickets } = useContractRead(contract, 'RemainingTickets');
	const { data: currentWinningReward } = useContractRead(contract, 'CurrentWinningReward');
	const { data: ticketCommission } = useContractRead(contract, 'ticketCommission');
	const { data: expiration } = useContractRead(contract, 'expiration');
	const { data: ticketPrice } = useContractRead(contract, 'ticketPrice');
	const { mutateAsync: BuyTickets } = useContractWrite(contract, 'BuyTickets');
	const { data: winners } = useContractRead(contract, 'getWinningsForAddress', [address]);
	const { mutateAsync: WithdrawWinnings } = useContractWrite(contract, 'WithdrawWinnings');
	const { data: lastWinner } = useContractRead(contract, 'lastWinner');
	const { data: lastWinnerAmount } = useContractRead(contract, 'lastWinnerAmount');
	const { data: lotteryOperator } = useContractRead(contract, 'lotteryOperator');
	const { data: tickets } = useContractRead(contract, 'getTickets');
	const [, actions] = useNotifications();

	const { t } = useTranslation('global');

	useEffect(() => {
		if (!tickets) return;

		const totalTickets: string[] = tickets;

		const noOfUserTickets = totalTickets.reduce(
			(total, ticketAddress) => (ticketAddress === address ? total + 1 : total),
			0,
		);
		setUserTicket(noOfUserTickets);
	}, [tickets, address]);

	const handleClick = async () => {
		if (!ticketPrice) return;

		const notification = actions.push({
			message: 'Buying Tickets...',
			options: {
				anchorOrigin: {
					horizontal: 'center',
					vertical: 'top',
				},
				variant: 'info',
			},
		});

		try {
			await BuyTickets({
				args: [],
				overrides: {
					value: ethers.utils.parseEther(
						(Number(ethers.utils.formatEther(ticketPrice)) * quantity).toString(),
					),
				},
			});

			actions.remove(notification);

			actions.push({
				message: 'Tickets bought successfully!',
				options: {
					anchorOrigin: {
						horizontal: 'center',
						vertical: 'top',
					},
					variant: 'success',
				},
			});
		} catch (error) {
			actions.remove(notification);
			actions.push({
				message: 'Whoops! Something went wrong',
				options: {
					anchorOrigin: {
						horizontal: 'center',
						vertical: 'top',
					},
					variant: 'error',
				},
			});

			console.error('contract call failure', error);
		}
	};

	const onWithdrawWinning = async () => {
		const notification = actions.push({
			message: 'Withdrawing Winnings...',
			options: {
				anchorOrigin: {
					horizontal: 'center',
					vertical: 'top',
				},
				variant: 'info',
			},
		});

		try {
			await WithdrawWinnings({ args: [] });

			actions.remove(notification);

			actions.push({
				message: 'Winnings withdrawn successfully!',
				options: {
					anchorOrigin: {
						horizontal: 'center',
						vertical: 'top',
					},
					variant: 'success',
				},
			});
		} catch (error) {
			actions.remove(notification);
			actions.push({
				message: 'Whoops! Something went wrong',
				options: {
					anchorOrigin: {
						horizontal: 'center',
						vertical: 'top',
					},
					variant: 'error',
				},
			});
			console.error('contract call failure', error);
		}
	};

	if (isLoading) return <Loading />;
	if (!address) return <LoginPrompt />;

	return (
		<>
			<Meta title="Lottery Game" />
			<Container
				maxWidth="lg"
				sx={{
					display: 'flex',
					flexDirection: 'column',
					minHeight: '100vh',
				}}
			>
				<Box sx={{ flex: 1 }}>
					<Box
						sx={{
							alignItems: 'center',
							backgroundColor: 'rgba(34, 197, 94, 0.15)', // Lightened background for better readability
							border: '1px solid rgba(34, 197, 94, 0.3)', // Slightly darker border for contrast
							borderRadius: 2,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							marginBottom: 3,
							padding: 3,
							boxShadow: 2, // Adding shadow for a lifted effect
							textAlign: 'center', // Center text alignment for a more balanced look
						}}
					>
						<Typography
							sx={{
								marginBottom: 1,
								fontWeight: 'bold', // Added bold for emphasis
								color: 'text.primary', // Ensuring text color adapts to theme
							}}
							variant="h6"
						>
							{t('lastWinner')}: {lastWinner?.toString()}
						</Typography>
						<Typography
							sx={{
								fontWeight: 'bold', // Added bold for emphasis
								color: 'text.secondary', // Different color for distinction
							}}
							variant="h6"
						>
							{t('previousWinnings')}:{' '}
							{lastWinnerAmount && ethers.utils.formatEther(lastWinnerAmount?.toString())}{' '}
							{currency}
						</Typography>
					</Box>
					{lotteryOperator === address && (
						<Box display="flex" justifyContent="center">
							<AdminControls />
						</Box>
					)}

					{winners > 0 && (
						<Box
							sx={{
								margin: 'auto',
								marginTop: 2,
								maxWidth: 'md',
								textAlign: 'center',
							}}
						>
							<Button
								color="success"
								fullWidth
								onClick={onWithdrawWinning}
								sx={{
									animation: 'pulse 2s infinite',
									flexDirection: 'column',
									fontSize: '1.2rem',
									gap: 1,
									padding: 3,
								}}
								variant="contained"
							>
								<Typography component="span" sx={{ fontWeight: 'bold' }} variant="h5">
									{t('winerwinerchickendinner')}
								</Typography>
								<Typography component="span" variant="h6">
									{t('totalWinnings')}: {ethers.utils.formatEther(winners.toString())} {currency}
								</Typography>
								<Typography component="span" variant="body1">
									{t('clickHereToWithdraw')}
								</Typography>
							</Button>
						</Box>
					)}

					<Grid
						alignItems="flex-start"
						container
						justifyContent="center"
						spacing={3}
						sx={{ marginTop: 2, animation: `${fadeIn} 1s ease-out` }}
					>
						<Grid item md={6} xs={12}>
							<Paper
								elevation={3}
								sx={{
									padding: 3,
									textAlign: 'center',
									borderRadius: 2,
									boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
									transition: '0.3s',
									'&:hover': {
										boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
									},
									animation: `${slideIn} 1s ease-out`,
								}}
							>
								<Typography sx={{ mb: 2, color: 'primary.main' }} variant="h4">
									{t('theNextDraw')}
								</Typography>
								<Box display="flex" justifyContent="space-between" padding={2}>
									<Box>
										<Typography variant="h6">{t('totalPool')}</Typography>
										<Typography sx={{ fontWeight: 'bold' }} variant="h5">
											{currentWinningReward &&
												ethers.utils.formatEther(currentWinningReward.toString())}{' '}
											{currency}
										</Typography>
									</Box>
									<Box>
										<Typography variant="h6">{t('ticketsRemaining')}</Typography>
										<Typography sx={{ fontWeight: 'bold' }} variant="h5">
											{remainingTickets?.toNumber()}
										</Typography>
									</Box>
								</Box>
								<CountdownTimer />
							</Paper>
						</Grid>
						<Grid item md={6} xs={12}>
							<Paper
								elevation={3}
								sx={{
									padding: 3,
									borderRadius: 2,
									boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
									transition: '0.3s',
									'&:hover': {
										boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
									},
									animation: `${slideIn} 1s ease-out`,
								}}
							>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
									sx={{ mb: 2 }}
								>
									<Typography variant="h6">{t('pricePerTicket')}</Typography>
									<Typography sx={{ fontWeight: 'bold' }} variant="h6">
										{ticketPrice && ethers.utils.formatEther(ticketPrice?.toString())} {currency}
									</Typography>
								</Box>
								<Box
									alignItems="center"
									border={1}
									borderColor="divider"
									display="flex"
									gap={2}
									marginY={2}
									padding={2}
									sx={{ borderRadius: 1, backgroundColor: 'background.default' }}
								>
									<Typography variant="body1">TICKET</Typography>
									<TextField
										InputProps={{
											disableUnderline: true,
											endAdornment: <InputAdornment position="end">Qty</InputAdornment>,
										}}
										fullWidth
										inputProps={{ max: 10, min: 1 }}
										onChange={(e) => setQuantity(Number(e.target.value))}
										type="number"
										value={quantity}
										variant="standard"
									/>
								</Box>
								<Box marginTop={2}>
									<Box display="flex" justifyContent="space-between">
										<Typography color="success.main" variant="body1">
											{t('totalCostTickets')}
										</Typography>
										<Typography color="success.main" variant="body1">
											{ticketPrice &&
												Number(ethers.utils.formatEther(ticketPrice?.toString())) * quantity}{' '}
											{currency}
										</Typography>
									</Box>
									<Box display="flex" justifyContent="space-between">
										<Typography color="success.main" variant="body2">
											{t('serviceFee')}
										</Typography>
										<Typography color="success.main" variant="body2">
											{ticketCommission && ethers.utils.formatEther(ticketCommission?.toString())}{' '}
											{currency}
										</Typography>
									</Box>
									<Box display="flex" justifyContent="space-between">
										<Typography color="success.main" variant="body2">
											{t('networkFee')}
										</Typography>
										<Typography color="success.main" variant="body2">
											TBC
										</Typography>
									</Box>
								</Box>
								<Button
									color="primary"
									disabled={
										expiration?.toString() < Date.now().toString() ||
										remainingTickets?.toNumber() === 0
									}
									fullWidth
									onClick={handleClick}
									sx={{
										marginTop: 2,
										py: 1.5,
										borderRadius: 1,
										backgroundColor: 'primary.main',
										color: 'white',
										transition: '0.3s',
										'&:hover': {
											backgroundColor: 'primary.dark',
											transform: 'scale(1.05)',
											boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
										},
									}}
									variant="contained"
								>
									{t('buy')} {quantity} {t('tickets')} {t('for')}{' '}
									{ticketPrice &&
										Number(ethers.utils.formatEther(ticketPrice.toString())) * quantity}{' '}
									{currency}
								</Button>
								{userTicket > 0 && (
									<Paper
										elevation={3}
										sx={{
											marginTop: 2,
											padding: 2,
											borderRadius: 2,
											boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
											animation: `${slideIn} 1s ease-out`,
										}}
									>
										<Typography variant="h6">You have {userTicket} Tickets in this draw</Typography>
										<Box display="flex" flexWrap="wrap" marginTop={2}>
											{Array(userTicket)
												.fill('')
												.map((_, index) => (
													<StarIcon color="primary" key={index} />
												))}
										</Box>
									</Paper>
								)}
							</Paper>
						</Grid>
					</Grid>
					<Box padding={2} textAlign="center">
						<Typography color="text.secondary" variant="body2">
							{t('disclaimer')}
						</Typography>
					</Box>
				</Box>
			</Container>
		</>
	);
};

export default Lottery;
