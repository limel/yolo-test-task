import { HeaderState } from 'types';
import s from './Header.module.scss';

const Header = ({ balance, bet, win }: HeaderState) => {
	return (
		<header className={s.header}>
			<ul className={s.statistic}>
				<li className={s.item}>
					<strong>Balance: </strong>
					<span>{balance}</span>
				</li>
				<li className={s.item}>
					<strong>Bet: </strong>
					<span>{bet}</span>
				</li>
				<li className={s.item}>
					<strong>Win: </strong>
					<span>{win}</span>
				</li>
			</ul>
		</header>
	);
};

export default Header;
