# Braidarr

A self-hosted list aggregator for the \*Arr ecosystem that intelligently combines and deduplicates media from multiple sources.

## Overview

Braidarr is a powerful tool that connects to Plex servers and custom JSON sources to create unified, deduplicated media lists for Radarr and Sonarr. It serves as a central hub for managing your media discovery and import lists, ensuring your \*Arr applications stay synchronized with your media preferences.

## Key Features

- **Plex Integration**: PIN-based authentication with automatic library discovery
- **Custom Sources**: Support for any JSON-based media list with flexible mapping
- **Smart Deduplication**: Intelligent media matching using TMDb, TVDb, and IMDb IDs
- **\*Arr Compatible**: Native integration with Radarr v5.x and Sonarr v4.x
- **Performance Optimized**: Handle 50,000+ items with sub-5 second response times
- **Docker Ready**: Multi-architecture support (amd64/arm64) with simple deployment
- **Secure by Design**: Argon2id password hashing, JWT sessions, rate limiting

## Project Status

🚧 **Currently in Development** - v1.3 Target Release: November 2025

Follow our progress on the [GitHub Project Board](https://github.com/[username]/braidarr/projects/1)

## Architecture

Braidarr is built with modern technologies:

- **Backend**: Node.js with TypeScript
- **Frontend**: React/Vue SPA
- **Database**: SQLite with WAL mode
- **ORM**: Drizzle
- **Deployment**: Docker with multi-arch support

## Quick Start

```bash
docker run -d \
  --name braidarr \
  -p 9797:9797 \
  -v /path/to/config:/config \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=America/Detroit \
  braidarr/braidarr:latest
```

## Documentation

- [Installation Guide](docs/installation.md) _(coming soon)_
- [Configuration](docs/configuration.md) _(coming soon)_
- [API Documentation](docs/api.md) _(coming soon)_
- [Development Setup](docs/development.md) _(coming soon)_

## Development Roadmap

### Phase 1: Core Infrastructure (Sprint 1-2)

- ✅ Project setup and repository initialization
- ⏳ Authentication system
- ⏳ Plex integration
- ⏳ Custom source mapping

### Phase 2: Export & Integration (Sprint 2-3)

- ⏳ Export endpoints
- ⏳ Radarr/Sonarr connectors
- ⏳ Deduplication engine

### Phase 3: Operations & Polish (Sprint 3-4)

- ⏳ Job scheduling
- ⏳ Docker packaging
- ⏳ Documentation
- ⏳ Release preparation

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) _(coming soon)_ for details.

### Development Team

This project is being developed by a dedicated team of specialized agents:

- **Project Manager**: Sprint planning and coordination
- **Lead Developer**: Technical leadership and architecture
- **Full-Stack Developer**: Core application development
- **Integration Engineer**: External APIs and DevOps
- **QA Engineer**: Testing and quality assurance

## License

[License Type TBD]

## Support

- **Issues**: [GitHub Issues](https://github.com/[username]/braidarr/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[username]/braidarr/discussions)

## Acknowledgments

Built to complement the amazing \*Arr ecosystem including Radarr, Sonarr, and Plex.

---

**Note**: This project is under active development. Features and documentation will be updated as development progresses.
