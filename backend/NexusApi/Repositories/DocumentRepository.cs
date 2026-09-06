using Dapper;
using NexusApi.Data;
using NexusApi.Models.Documents;

namespace NexusApi.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public DocumentRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<DocumentListItemResponse>> GetAllAsync(string? search)
    {
        const string sql = @"
            SELECT
                d.Id, p.Name AS ProductName, d.Name, d.DocumentType, d.UrlReference, d.LastUpdatedDate,
                COALESCE(u.FullName, 'Unassigned') AS OwnerName
            FROM Documents d
            JOIN Products p ON p.Id = d.ProductId
            LEFT JOIN Users u ON u.Id = d.UpdatedBy
            WHERE (@Search IS NULL OR d.Name LIKE CONCAT('%', @Search, '%')
                                  OR p.Name LIKE CONCAT('%', @Search, '%'))
            ORDER BY d.LastUpdatedDate DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<DocumentListItemResponse>(sql, new { Search = string.IsNullOrWhiteSpace(search) ? null : search });
    }

    public async Task CreateAsync(CreateGlobalDocumentRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO Documents (ProductId, Name, DocumentType, UrlReference, LastUpdatedDate, CreatedBy, UpdatedBy, CreatedAt)
            VALUES (@ProductId, @Name, @DocumentType, @UrlReference, CURDATE(), @UserId, @UserId, UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new { request.ProductId, request.Name, request.DocumentType, request.UrlReference, UserId = userId });
    }
}