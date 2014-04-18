-- Create the Encounters table
IF NOT EXISTS (SELECT * FROM sys.objects
	WHERE object_id = OBJECT_ID(N'[dbo].[Encounters]')
	AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Encounters] (
	[id] [int] NOT NULL IDENTITY,
	[ptId] [nvarchar] (50) NOT NULL,
	[orgId] [nvarchar] (50) NULL,
	[emails] [nvarchar] (200) NULL,
	[emailHash] [nvarchar] (200) NULL,
	[encounterDate] [datetime] NOT NULL,
	[curBP] [nvarchar] (200) NULL,
	[curTargetBP] [nvarchar] (200) NULL,
	[curMeds] [nvarchar] (2000) NULL,
	[age] [nvarchar] (50) NULL,
	[race] [nvarchar] (50) NULL,
	[hasCKD] [nvarchar] (50) NULL,
	[hasDiabetes] [nvarchar] (50) NULL,
CONSTRAINT [PK_Encounters] PRIMARY KEY CLUSTERED
	(
	[id] ASC
	)WITH (IGNORE_DUP_KEY = OFF)
	)
END;
GO
