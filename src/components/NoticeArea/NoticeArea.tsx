/* eslint-disable indent */
/* eslint-disable react/prop-types */
import { Bet, GameStatus, GameResult } from 'types';
import cn from 'classnames';
import s from './NoticeArea.module.scss';

interface NoticeAreaProps {
	playerBet: Bet[];
	pcBet: Bet | null;
	winnerCard: Bet | undefined;
	win: number;
	status: GameStatus;
	bet: number;
	result: GameResult | null;
}
const NoticeArea: React.FC<NoticeAreaProps> = ({ playerBet, winnerCard, pcBet, win, status, bet, result }) => {
	const winMessage = () => {
		switch (result) {
			case GameResult.Win:
				return (
					<>
						<strong>{winnerCard?.value} wins </strong>
						<span>
							you win <span>{win}</span>
						</span>
					</>
				);
			case GameResult.Lose:
				return (
					<>
						<strong>{pcBet?.value} wins </strong>
						<span>
							you lose <span>{bet}</span>
						</span>
					</>
				);
			case GameResult.Draw:
				return (
					<>
						<strong>Draw </strong>
						<span>
							you lose <span>0</span>
						</span>
					</>
				);
			default:
				return (
					<>
						<strong>Draw </strong>
						<span>
							you lose <span>0</span>
						</span>
					</>
				);
		}
	};

	return (
		<section className={s.container}>
			<div
				className={cn(s.notice, {
					[s.active]: status === GameStatus.Start,
				})}>
				<span className={s.notice__text}>Make your bet</span>
			</div>

			<div
				className={cn(s.bets, {
					[s.active]: status === GameStatus.Pending,
				})}>
				<strong>{playerBet[0]?.value}</strong>
				<span>vs</span>
				<strong>{pcBet?.value}</strong>
			</div>
			<div
				className={cn(s.winner, {
					[s.active]: status === GameStatus.End,
				})}>
				{winMessage()}
			</div>
		</section>
	);
};

export default NoticeArea;
