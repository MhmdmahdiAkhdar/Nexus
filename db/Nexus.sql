CREATE TABLE [Roles] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [Name] nvarchar(255),
  [Description] nvarchar(255),
  [IsSystemRole] bool,
  [CreatedAt] datetime
)
GO

CREATE TABLE [Permissions] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [Code] nvarchar(255),
  [Description] nvarchar(255)
)
GO

CREATE TABLE [RolePermissions] (
  [RoleId] int,
  [PermissionId] int,
  PRIMARY KEY ([RoleId], [PermissionId])
)
GO

CREATE TABLE [Users] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [Email] nvarchar(255) UNIQUE,
  [PasswordHash] nvarchar(255),
  [FullName] nvarchar(255),
  [RoleId] int,
  [IsActive] bool,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [Products] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [Name] nvarchar(255),
  [Description] text,
  [BusinessPurpose] text,
  [LifecycleStatus] nvarchar(255),
  [CurrentVersion] nvarchar(255),
  [SupportedMarkets] nvarchar(255),
  [Criticality] nvarchar(255),
  [Technologies] nvarchar(255),
  [CreatedBy] int,
  [UpdatedBy] int,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [Modules] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [ProductId] int,
  [Name] nvarchar(255),
  [Description] text,
  [Status] nvarchar(255),
  [CreatedBy] int,
  [UpdatedBy] int,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [Repositories] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [ProductId] int,
  [Name] nvarchar(255),
  [GitHubUrl] nvarchar(255) UNIQUE,
  [MainBranch] nvarchar(255),
  [CreatedBy] int,
  [CreatedAt] datetime
)
GO

CREATE TABLE [RepositoryUpdates] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [RepositoryId] int,
  [Title] nvarchar(255),
  [Description] text,
  [CommitReference] nvarchar(255),
  [UpdatedBy] int,
  [UpdateDate] date,
  [CreatedAt] datetime
)
GO

CREATE TABLE [Documents] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [ProductId] int,
  [Name] nvarchar(255),
  [DocumentType] nvarchar(255),
  [UrlReference] nvarchar(255),
  [LastUpdatedDate] date,
  [CreatedBy] int,
  [UpdatedBy] int,
  [CreatedAt] datetime
)
GO

CREATE TABLE [Clients] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [CompanyName] nvarchar(255),
  [Country] nvarchar(255),
  [ContactInfo] nvarchar(255),
  [Status] nvarchar(255),
  [CreatedBy] int,
  [UpdatedBy] int,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [Deployments] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [ClientId] int,
  [ProductId] int,
  [ProductVersion] nvarchar(255),
  [GoLiveDate] date,
  [DeploymentStatus] nvarchar(255),
  [SupportTier] nvarchar(255),
  [CreatedBy] int,
  [UpdatedBy] int,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [DeploymentModules] (
  [DeploymentId] int,
  [ModuleId] int,
  PRIMARY KEY ([DeploymentId], [ModuleId])
)
GO

CREATE TABLE [Environments] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [DeploymentId] int,
  [EnvironmentName] nvarchar(255),
  [EnvironmentType] nvarchar(255),
  [ServerName] nvarchar(255),
  [ApplicationUrl] nvarchar(255),
  [AccessReference] nvarchar(255),
  [CreatedBy] int,
  [UpdatedBy] int,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [TeamMembers] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [FullName] nvarchar(255),
  [JobTitle] nvarchar(255),
  [Department] nvarchar(255),
  [Email] nvarchar(255),
  [Status] nvarchar(255),
  [CreatedBy] int,
  [UpdatedBy] int,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [ProductResponsibilities] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [ProductId] int,
  [TeamMemberId] int,
  [Responsibility] nvarchar(255),
  [Description] nvarchar(255),
  [CreatedBy] int,
  [CreatedAt] datetime
)
GO

ALTER TABLE [RolePermissions] ADD FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id])
GO

ALTER TABLE [RolePermissions] ADD FOREIGN KEY ([PermissionId]) REFERENCES [Permissions] ([Id])
GO

ALTER TABLE [Users] ADD FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id])
GO

ALTER TABLE [Products] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Products] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Modules] ADD FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id])
GO

ALTER TABLE [Modules] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Modules] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Repositories] ADD FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id])
GO

ALTER TABLE [Repositories] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [RepositoryUpdates] ADD FOREIGN KEY ([RepositoryId]) REFERENCES [Repositories] ([Id])
GO

ALTER TABLE [RepositoryUpdates] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [TeamMembers] ([Id])
GO

ALTER TABLE [Documents] ADD FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id])
GO

ALTER TABLE [Documents] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Documents] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Clients] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Clients] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Deployments] ADD FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id])
GO

ALTER TABLE [Deployments] ADD FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id])
GO

ALTER TABLE [Deployments] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Deployments] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [DeploymentModules] ADD FOREIGN KEY ([DeploymentId]) REFERENCES [Deployments] ([Id])
GO

ALTER TABLE [DeploymentModules] ADD FOREIGN KEY ([ModuleId]) REFERENCES [Modules] ([Id])
GO

ALTER TABLE [Environments] ADD FOREIGN KEY ([DeploymentId]) REFERENCES [Deployments] ([Id])
GO

ALTER TABLE [Environments] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [Environments] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [TeamMembers] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [TeamMembers] ADD FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([Id])
GO

ALTER TABLE [ProductResponsibilities] ADD FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id])
GO

ALTER TABLE [ProductResponsibilities] ADD FOREIGN KEY ([TeamMemberId]) REFERENCES [TeamMembers] ([Id])
GO

ALTER TABLE [ProductResponsibilities] ADD FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id])
GO
