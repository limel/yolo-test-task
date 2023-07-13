import React from 'react';
import Header from 'components/Header';
import NoticeArea from 'components/NoticeArea';
import BetArea from 'components/BetArea';
import Card from 'components/Card';
import { AppState, BetPositions, GameStatus, ICard, GameResult } from 'types';

const cards = [
	{
		title: 'Rock',
		color: '#211f4f',
		betAmount: 0,
		value: BetPositions.Rock,
		winsAgainst: [BetPositions.Scissors],
	},
	{
		title: 'Paper',
		color: '#1a381d',
		betAmount: 0,
		value: BetPositions.Paper,
		winsAgainst: [BetPositions.Rock],
	},
	{
		title: 'Scissors',
		color: '#50091e',
		betAmount: 0,
		value: BetPositions.Scissors,
		winsAgainst: [BetPositions.Paper],
	},
];

export default class App extends React.Component<object, AppState> {
	private endGameTimeout: NodeJS.Timeout | null = null;
	constructor(props: object) {
		super(props);
		this.state = {
			balance: 5000,
			bet: 0,
			win: 0,
			step: 500,
			winRate: 14,
			winnerCard: null,
			status: GameStatus.Start,
			result: null,
			playerBet: [],
			pcBet: null,
			cards,
		};
	}

	handleCardClick = (card: ICard) => {
		const currentCardValue = card.value;
		const isSelectedCard = this.state.playerBet.map(betCard => betCard.value).includes(currentCardValue);

		if (this.state.balance === 0) {
			return;
		}

		if (this.state.playerBet.length !== 2 && !isSelectedCard) {
			this.addPlayerBet(card);
			this.updateBalance();
			this.updateCardBetAmount(card);
			this.updateWinRate();
			return;
		}

		if (isSelectedCard) {
			this.updateBalance();
			this.updateCardBetAmount(card);
			this.updateWinRate();
		}
	};

	disableUnSelectedCards = () => {
		this.setState(prevState => {
			const { cards, playerBet } = prevState;
			const updatedCards = cards.map(card => {
				const isBetCard = playerBet.map(betCard => betCard.value).includes(card.value);
				return isBetCard ? card : { ...card, disabled: true };
			});
			return {
				...prevState,
				cards: updatedCards,
			};
		});
	};

	updateWinRate = () => {
		this.setState((prevState: AppState) => ({
			winRate: prevState.playerBet.length >= 2 ? 3 : 14,
		}));
	};

	updateBalance = () => {
		this.setState(
			(prevState): AppState => {
				const { balance, bet } = prevState;
				const { step } = this.state;

				const updatedBalance = balance - step;
				const updatedBet = bet + step;

				return {
					...prevState,
					balance: updatedBalance,
					bet: updatedBet,
				};
			},
			() => {
				if (this.state.balance === 0) {
					this.disableUnSelectedCards();
				}
			}
		);
	};

	addPlayerBet = (card: ICard) => {
		const newPlayerBet = {
			value: card.value,
			winsAgainst: card.winsAgainst,
		};

		this.setState(
			(prevState): AppState => {
				const { playerBet } = prevState;
				const updatedPlayerBet = [...playerBet, newPlayerBet];

				return {
					...prevState,
					playerBet: updatedPlayerBet,
				};
			},
			() => {
				if (this.state.playerBet.length === 2) {
					this.disableUnSelectedCards();
				}
			}
		);
	};

	updateCardBetAmount = (card: ICard) => {
		this.setState(prevState => {
			const prevCards = prevState.cards;
			const { step } = this.state;
			return {
				cards: prevCards.map(prevCard => {
					const currentCard = prevCard.value === card.value;
					return currentCard ? { ...prevCard, betAmount: prevCard.betAmount + step } : prevCard;
				}),
			};
		});
	};

	getRandomCard = () => {
		const randomIndex = Math.floor(Math.random() * cards.length);
		return cards[randomIndex];
	};

	addPcBet = () => {
		const randomCard = this.getRandomCard();
		const newPcbet = {
			value: randomCard.value,
			winsAgainst: randomCard.winsAgainst,
		};
		this.setState({ pcBet: newPcbet }, this.checkWinner);
	};

	handleStartGame = () => {
		const { playerBet } = this.state;
		if (playerBet.length !== 0) {
			this.addPcBet();
			this.setState({ status: GameStatus.Pending });
		}
	};

	handleResetGame = () => {
		this.setState(
			prevState => {
				const { balance, win, result, bet } = prevState;

				const updateBalance =
					result === GameResult.Win ? balance + win : result === GameResult.Draw ? balance + bet : balance;

				return {
					...prevState,
					balance: updateBalance,
					bet: 0,
					win: 0,
					playerBet: [],
					status: GameStatus.Start,
					pcBet: null,
					cards: cards.map(card => ({ ...card, betAmount: 0 })),
				};
			},
			() => {
				if (this.endGameTimeout) {
					clearTimeout(this.endGameTimeout);
				}
				if (this.state.balance === 0) {
					this.disableUnSelectedCards();
				}
			}
		);
	};

	checkWinner = () => {
		const { playerBet, pcBet, cards } = this.state;
		const pcBetValue = pcBet?.value as BetPositions;
		const isPlayerWinner = playerBet.some(card => card.winsAgainst.includes(pcBetValue));

		if (isPlayerWinner) {
			const winnerCard = cards.find(card => card.winsAgainst.includes(pcBetValue));
			if (!winnerCard) return;
			const updatedCards = cards.map(card => (card.value === winnerCard.value ? { ...card, winner: true } : card));
			this.setState({ cards: updatedCards });
			this.handlePlayerWin();
			return;
		}
		if (!isPlayerWinner) {
			const isTie = playerBet.some(card => card.value === pcBetValue);
			if (isTie) {
				this.handleDraw();
			} else {
				this.handlePcWin();
			}
		}
	};

	getWinnerBet = () => {
		const { pcBet, cards } = this.state;
		const pcBetValue = pcBet?.value as BetPositions;
		const winnerCard = cards.find(card => card.winsAgainst.includes(pcBetValue));
		return winnerCard;
	};

	handlePlayerWin = () => {
		this.endGameTimeout = setTimeout(() => {
			this.setState(prevState => {
				const { bet, winRate } = prevState;
				const winnerBet = bet * winRate;
				return {
					...prevState,
					win: winnerBet,
					result: GameResult.Win,
					status: GameStatus.End,
				};
			});
		}, 5000);
	};

	handleDraw = () => {
		this.endGameTimeout = setTimeout(() => {
			this.setState({
				result: GameResult.Draw,
				status: GameStatus.End,
			});
		}, 5000);
	};

	handlePcWin = () => {
		this.endGameTimeout = setTimeout(() => {
			this.setState({
				result: GameResult.Lose,
				status: GameStatus.End,
			});
		}, 5000);
	};

	render() {
		const { balance, bet, win, cards, status } = this.state;
		return (
			<>
				<Header balance={balance} bet={bet} win={win} />
				<main className="app">
					<NoticeArea
						result={this.state.result}
						playerBet={this.state.playerBet}
						winnerCard={this.getWinnerBet()}
						pcBet={this.state.pcBet}
						win={this.state.win}
						status={status}
						bet={this.state.bet}
					/>
					<BetArea status={status}>
						{cards.map(card => (
							<Card
								key={card.value}
								title={card.title}
								color={card.color}
								betAmount={card.betAmount}
								winner={card?.winner}
								disabled={card?.disabled}
								onClick={() => this.handleCardClick(card)}
							/>
						))}
					</BetArea>
					{status === GameStatus.End && (
						<button className="button" onClick={() => this.handleResetGame()}>
							clear
						</button>
					)}
					{(status === GameStatus.Start || status === GameStatus.Pending) && (
						<button className="button" disabled={status === GameStatus.Pending} onClick={() => this.handleStartGame()}>
							start
						</button>
					)}
				</main>
			</>
		);
	}
}
