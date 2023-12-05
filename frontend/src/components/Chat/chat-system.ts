
import { queryClient } from '../../query-client';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import { ChannelMessage, fetchChannelMessages, postChannelMessage } from '../../api';
import { useMutation, useQuery } from 'react-query';

const makeChannelMessageKey = (channelId: number) => ([ 'channel', channelId, 'messages ']);

export function insertMessage(channelId: number, message: ChannelMessage) {
    const queryKey = makeChannelMessageKey(channelId);

    const previousMessages = queryClient.getQueryData<ChannelMessage[]>(queryKey);

    if (!previousMessages) {
        /* The channel hasn't been loaded yet, the message will appear on the next channel load ! */
        return ;
    }

    queryClient.setQueryData<ChannelMessage[]>(queryKey,
        uniqBy(sortBy([
            ...previousMessages,
            message,
        ], 'id'), 'id'));
}

export function useChannelMessages(channelId: number) {
    return useQuery(makeChannelMessageKey(channelId), () => fetchChannelMessages(channelId), { staleTime: Infinity });
}

export function usePostChannelMessage(channelId: number) {
    return useMutation({
		mutationFn: (content: string) => postChannelMessage(channelId, content),
		onSuccess(data) {
			insertMessage(channelId, data);
		},
	});
}
