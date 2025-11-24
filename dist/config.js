export function loadConfig() {
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    const port = parseInt(process.env.PORT || '3002', 10);
    return {
        openAiApiKey,
        port,
        nodeEnv,
        isProduction: nodeEnv === 'production',
    };
}
