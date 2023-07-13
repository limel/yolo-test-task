import { ICard, AppState, AppSetState } from 'types';

export const handleCardClick = (card: ICard, state: AppState, setState: AppSetState) => {
	const currentCardValue = card.value;
	const isSelectedCard = state.playerBet.map(betCard => betCard.value).includes(currentCardValue);

	if (state.balance === 0) {
		return;
	}

	if (state.playerBet.length !== 2 && !isSelectedCard) {
		addPlayerBet(card, setState);
		updateCardBetAmount(card, setState);
		updatedBalance(setState);
		updateWinRate(setState);
	}

	if (isSelectedCard) {
		updatedBalance(setState);
		updateCardBetAmount(card, setState);
		updateWinRate(setState);
	}
};

const addPlayerBet = (card: ICard, setState: AppSetState) => {
	const newPlayerBet = {
		value: card.value,
		winsAgainst: card.winsAgainst,
	};

	setState((prevState: AppState) => {
		const updatedPlayerBet = [...prevState.playerBet, newPlayerBet];

		const updatedState: AppState = {
			...prevState,
			playerBet: updatedPlayerBet,
		};

		if (updatedPlayerBet.length === 2) {
			return {
				...updatedState,
				cards: disableCards(updatedState),
			};
		}

		return updatedState;
	});
};

const updatedBalance = (setState: AppSetState) => {
	setState((prevState: AppState) => {
		const { balance, bet, step } = prevState;
		const updatedBalance = balance - step;
		const updatedBet = bet + step;

		const updatedState = {
			...prevState,
			balance: updatedBalance,
			bet: updatedBet,
		};

		if (updatedBalance === 0) {
			return {
				...updatedState,
				cards: disableCards(updatedState),
			};
		}
		return updatedState;
	});
};

const updateCardBetAmount = (card: ICard, setState: AppSetState) => {
	setState((prevState: AppState) => {
		const prevCards = prevState.cards;
		const step = prevState.step;
		const updatedCards = prevCards.map(prevCard => {
			const isCurrentCard = prevCard.value === card.value;
			return isCurrentCard ? { ...prevCard, betAmount: prevCard.betAmount + step } : prevCard;
		});

		return {
			...prevState,
			cards: updatedCards,
		};
	});
};

const updateWinRate = (setState: AppSetState) => {
	setState((prevState: AppState) => ({
		...prevState,
		winRate: prevState.playerBet.length === 2 ? 3 : 14,
	}));
};

// this function used in another palce also
export const disableCards = (prevState: AppState) => {
	const { cards, playerBet } = prevState;
	const updatedCards = cards.map(card => {
		const isBetCard = playerBet.map(betCard => betCard.value).includes(card.value);
		return isBetCard ? card : { ...card, disabled: true };
	});

	return updatedCards;
};
