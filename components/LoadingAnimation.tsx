import { FC } from 'react';
import ReactLoading from 'react-loading';
import { Box, Flex, Text } from '@chakra-ui/react';
export interface LoadingProps {
    loading: boolean,
    text: string
}

const LoadingAnimation: FC<LoadingProps> = ({ loading = false, text = "Loading" }) => (
    <>
        {loading &&
            <Flex position="absolute" bottom="30px" left="35px" bg='black' p={3} pt={0} borderRadius="1em" alignItems="flex-start" shadow={'lg'}>
                <Text fontSize="md" className='light' fontWeight={600} mt={3} mr={2}>{text}</Text>
                <ReactLoading height={0} width={50} type={'cylon'} color="rgb(245, 235, 221)" />
            </Flex>
        }
    </>
);

export default LoadingAnimation;