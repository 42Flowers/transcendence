import React from 'react';
import cx from 'classnames';
import { ChannelMessage } from '../../api';
import { useAuthContext } from '../../contexts/AuthContext';

export type MessageViewProps = {
    messages: ChannelMessage[];
};

export const MessageView: React.FC<MessageViewProps> = ({ messages }) => {
    const { user } = useAuthContext();

	return (
		<div className="chat-container">
			<ul className="chat-box">
				{
                    messages.map(({ id, content, author }) => (
                        <li key={id} className={cx({ 'is-right': (author.id === user?.id) })}>
                            {content}
                        </li>
                    ))
                }
			</ul>
		</div>
	);
};
