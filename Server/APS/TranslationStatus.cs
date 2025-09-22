 using System.Collections.Generic;
public record TranslationStatus(string Status, string? Progress, IEnumerable<string>? Messages);
