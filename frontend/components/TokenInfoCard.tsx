import React from 'react';
import { TokenInfo } from '../models/dataTypes';
import { Box, Flex, Text, Image } from '@chakra-ui/react';

interface TokenInfoCardProps {
    tokenInfo: TokenInfo
}

const TokenInfoCard: React.FC<TokenInfoCardProps> = ({ tokenInfo }) => {
    return (
        <Box py="5" px="4" mb="2" borderRadius={20} bg="rgba(0,0,0,.05)" shadow={"md"}>
            <Flex>
                <Box flex={2} mr="5">
                    <Flex alignItems="flex-start">
                        <Box>
                            <Image src={tokenInfo.logoURI} alt={`${tokenInfo.symbol} logo`} boxSize="50px" mr="2" />
                        </Box>
                        <Box>
                            <Text
                                fontSize="xl"
                                fontWeight="bold">{tokenInfo.name}</Text>

                            <Text
                                fontSize="md"
                                fontWeight="md">{tokenInfo.amount} {tokenInfo.symbol}</Text>
                        </Box>
                    </Flex>
                </Box>
                <Box flex={1}>
                    <Text>${tokenInfo.value}</Text>
                </Box>
                <Box>
                    <Text
                        fontSize="sm"
                        fontWeight="md">
                        {`${tokenInfo.tokenAddress.slice(0, 4)}...${tokenInfo.tokenAddress.slice(-4)}`}
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
};

export default TokenInfoCard;
