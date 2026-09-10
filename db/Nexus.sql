CREATE TABLE `Roles` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255),
  `Description` VARCHAR(255),
  `IsSystemRole` BOOLEAN,
  `CreatedAt` DATETIME
);

CREATE TABLE `Permissions` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Code` VARCHAR(255),
  `Description` VARCHAR(255)
);

CREATE TABLE `RolePermissions` (
  `RoleId` INT,
  `PermissionId` INT,
  PRIMARY KEY (`RoleId`, `PermissionId`),
  FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`),
  FOREIGN KEY (`PermissionId`) REFERENCES `Permissions` (`Id`)
);

CREATE TABLE `Users` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Email` VARCHAR(255) UNIQUE,
  `PasswordHash` VARCHAR(255),
  `FullName` VARCHAR(255),
  `RoleId` INT,
  `IsActive` BOOLEAN,
  `MustChangePassword` BOOLEAN NOT NULL DEFAULT TRUE,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME,
  FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`)
);

CREATE TABLE `Products` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255),
  `Description` TEXT,
  `BusinessPurpose` TEXT,
  `LifecycleStatus` VARCHAR(255),
  `CurrentVersion` VARCHAR(255),
  `SupportedMarkets` VARCHAR(255),
  `Criticality` VARCHAR(255),
  `Technologies` VARCHAR(255),
  `Notes` TEXT NULL,
  `OwningTeam` VARCHAR(255) NULL,
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME,
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `Modules` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `Name` VARCHAR(255),
  `Description` TEXT,
  `Status` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME,
  FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`),
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `Repositories` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `Name` VARCHAR(255),
  `GitHubUrl` VARCHAR(255) UNIQUE,
  `MainBranch` VARCHAR(255),
  `Description` TEXT NULL,
  `CreatedBy` INT,
  `CreatedAt` DATETIME,
  FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`),
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `RepositoryUpdates` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `RepositoryId` INT,
  `Title` VARCHAR(255),
  `Description` TEXT,
  `CommitReference` VARCHAR(255),
  `UpdatedBy` INT,
  `UpdateDate` DATE,
  `CreatedAt` DATETIME,
  FOREIGN KEY (`RepositoryId`) REFERENCES `Repositories` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `TeamMembers` (`Id`)
);

CREATE TABLE `Documents` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `Name` VARCHAR(255),
  `DocumentType` VARCHAR(255),
  `UrlReference` VARCHAR(255),
  `LastUpdatedDate` DATE,
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`),
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `Clients` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `CompanyName` VARCHAR(255),
  `Country` VARCHAR(255),
  `Industry` VARCHAR(255) NULL,
  `PrimaryContactName` VARCHAR(255) NULL,
  `PrimaryContactEmail` VARCHAR(255) NULL,
  `SupportPhone` VARCHAR(255) NULL,
  `RegisteredOffice` VARCHAR(255) NULL,
  `AccountOwner` VARCHAR(255) NULL,
  `Notes` TEXT NULL,
  `ContactInfo` VARCHAR(255),
  `Status` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME,
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `Deployments` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ClientId` INT,
  `ProductId` INT,
  `ProductVersion` VARCHAR(255),
  `GoLiveDate` DATE,
  `DeploymentStatus` VARCHAR(255),
  `SupportTier` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME,
  FOREIGN KEY (`ClientId`) REFERENCES `Clients` (`Id`),
  FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`),
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `DeploymentModules` (
  `DeploymentId` INT,
  `ModuleId` INT,
  PRIMARY KEY (`DeploymentId`, `ModuleId`),
  FOREIGN KEY (`DeploymentId`) REFERENCES `Deployments` (`Id`),
  FOREIGN KEY (`ModuleId`) REFERENCES `Modules` (`Id`)
);

CREATE TABLE `Environments` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `DeploymentId` INT,
  `EnvironmentName` VARCHAR(255),
  `EnvironmentType` VARCHAR(255),
  `Purpose` VARCHAR(255) NULL,
  `ServerName` VARCHAR(255),
  `OperatingSystem` VARCHAR(255) NULL,
  `ApplicationUrl` VARCHAR(255),
  `DatabaseInfo` VARCHAR(255) NULL,
  `MonitoringLink` VARCHAR(255) NULL,
  `AccessReference` VARCHAR(255),
  `Notes` TEXT NULL,
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME,
  FOREIGN KEY (`DeploymentId`) REFERENCES `Deployments` (`Id`),
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `TeamMembers` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `FullName` VARCHAR(255),
  `JobTitle` VARCHAR(255),
  `Department` VARCHAR(255),
  `Email` VARCHAR(255),
  `Status` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME,
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`),
  FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`)
);

CREATE TABLE `ProductResponsibilities` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `TeamMemberId` INT,
  `Responsibility` VARCHAR(255),
  `Description` VARCHAR(255),
  `CreatedBy` INT,
  `CreatedAt` DATETIME,
  FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`),
  FOREIGN KEY (`TeamMemberId`) REFERENCES `TeamMembers` (`Id`),
  FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`)
);