import { GameStatus } from 'types';
import s from './BetArea.module.scss';
import cn from 'classnames';

const BetArea = ({ children, status }: { children: React.ReactNode; status: GameStatus }) => {
	return (
		<div>
			<span
				className={cn(s.notice, {
					[s.active]: status === GameStatus.Start,
				})}>
				Pick your positions
			</span>
			<ul className={s.list}>{children}</ul>
		</div>
	);
};

export default BetArea;
