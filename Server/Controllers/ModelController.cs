 using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ModelsController : ControllerBase
{
    public record BucketObject(string name, string urn);

    private readonly APS _aps;
    public ModelsController(APS aps) => _aps = aps;

    [HttpGet()]
    public async Task<IEnumerable<BucketObject>> GetModels()
    {
        var objects = await _aps.GetObjects();
        return objects.Select(o => new BucketObject(o.ObjectKey, APS.Base64Encode(o.ObjectId)));
    }

    [HttpGet("{urn}/status")]
    public async Task<TranslationStatus> GetModelStatus(string urn)
        => await _aps.GetTranslationStatus(urn);

    public class UploadModelForm
    {
        [FromForm(Name = "model-zip-entrypoint")]
        public string? Entrypoint { get; set; }
        [FromForm(Name = "model-file")]
        public IFormFile? File { get; set; }   // Marked nullable to avoid CS8618
    }

    [HttpPost(), DisableRequestSizeLimit]
    public async Task<BucketObject> UploadAndTranslateModel([FromForm] UploadModelForm form)
    {
        if (form.File == null)
            throw new ArgumentException("No file provided!");

        using var stream = form.File.OpenReadStream();
        var obj = await _aps.UploadModel(form.File.FileName, stream);
        var job = await _aps.TranslateModel(obj.ObjectId, form.Entrypoint);
        return new BucketObject(obj.ObjectKey, job.Urn);
    }
}
