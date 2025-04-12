export const config = {
    port: process.env.PORT || 3100,
    databaseUrl: process.env.MONGODB_URI || 'mongodb+srv://<user1>:<user1>@cluster0.lqtuttv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    socketPort: process.env.PORT || 3000
};