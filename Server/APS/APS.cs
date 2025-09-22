 public partial class APS
{
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _bucket;
    private Token? _internalTokenCache;
    private Token? _publicTokenCache;

    public APS(string clientId, string clientSecret, string? bucket = null)
    {
        _clientId = clientId;
        _clientSecret = clientSecret;
        _bucket = string.IsNullOrEmpty(bucket) ? $"{clientId.ToLower()}-basic-app" : bucket;
    }
}
