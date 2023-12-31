import React from 'react';
import cn from 'classnames';
import s from './Card.module.scss';

interface CardProps {
	title: string;
	betAmount: number;
	color: string;
	winner?: boolean;
	disabled?: boolean;
	onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, betAmount, color, winner, disabled, onClick }) => (
	<li
		onClick={onClick}
		tabIndex={0}
		onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => {
			if (event.key === 'Enter' || event.key === ' ') {
				onClick();
			}
		}}
		className={cn(s.card, {
			[s.card_winner]: winner,
			[s.card_disabled]: disabled,
		})}
		style={{ '--card-color': color } as React.CSSProperties}>
		<div className={s.bet}>{betAmount}</div>
		<div className={s.title}>{title}</div>
	</li>
);

export default Card;
