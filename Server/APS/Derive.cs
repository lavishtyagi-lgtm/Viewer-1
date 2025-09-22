 using System.Collections.Generic;
using System.Threading.Tasks;
using Autodesk.ModelDerivative;
using Autodesk.ModelDerivative.Model;

public partial class APS
{
    public static string Base64Encode(string plainText)
    {
        var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
        return System.Convert.ToBase64String(plainTextBytes).TrimEnd('=');
    }

    public async Task<Job> TranslateModel(string objectId, string? rootFilename)
    {
        var auth = await GetInternalToken();
        var modelDerivativeClient = new ModelDerivativeClient();
        var svf2Format = new JobPayloadFormatSVF2
        {
            Views = new List<View> { View._2d, View._3d }
        };
        var output = new JobPayloadOutput
        {
            Formats = new List<IJobPayloadFormat> { svf2Format }
        };
        var input = new JobPayloadInput
        {
            Urn = Base64Encode(objectId)
        };
        if (!string.IsNullOrEmpty(rootFilename))
        {
            input.RootFilename = rootFilename;
            input.CompressedUrn = true;
        }

        var payload = new JobPayload
        {
            Input = input,
            Output = output
        };

        return await modelDerivativeClient.StartJobAsync(
            jobPayload: payload,
            region: Region.US,
            accessToken: auth.AccessToken
        );
    }

    public async Task<TranslationStatus> GetTranslationStatus(string urn)
    {
        var auth = await GetInternalToken();
        var modelDerivativeClient = new ModelDerivativeClient();
        try
        {
            var manifest = await modelDerivativeClient.GetManifestAsync(urn, accessToken: auth.AccessToken);
            return new TranslationStatus(manifest.Status, manifest.Progress, new List<string>());
        }
        catch (ModelDerivativeApiException ex) when (
            ex.HttpResponseMessage.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return new TranslationStatus("n/a", "", null);
        }
    }
}
