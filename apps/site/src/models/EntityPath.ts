export class EntityPath {
  public readonly sessionId: string;
  public readonly segments: string[] = [];

  private constructor(sessionId: string, segments: string[]) {
    this.sessionId = sessionId;
    this.segments = segments.filter(Boolean).filter((s) => !isEmpty(s.trim()));
  }

  static empty(): EntityPath {
    return new EntityPath('', []);
  }

  static root(sessionId: string): EntityPath {
    return new EntityPath(sessionId, []);
  }

  static fromRoute({
    sessionId,
    mount,
  }: {
    sessionId: string;
    mount: string;
  }): EntityPath {
    if (isEmpty(mount) || mount === '/') {
      return new EntityPath(sessionId, []);
    }
    if (mount.startsWith('/') || mount.endsWith('/'))
      throw new Error('Invalid path with slash');

    const segments = [];
    const cleaned = mount.replace(/^\/+|\/+$/g, '');
    if (cleaned) {
      segments.push(...cleaned.split('/').filter(Boolean));
    }
    return new EntityPath(sessionId, segments);
  }

  static fromString(s: string): EntityPath {
    if (s.startsWith('/') || s.endsWith('/'))
      throw new Error('Invalid path with slash');
    if (!s.startsWith('sessions')) throw new Error('Invalid path no session');
    if (!s.includes('/mount')) throw new Error('Invalid path no mount');
    const arr = s.split('/');
    return EntityPath.fromRoute({
      sessionId: arr[1],
      mount: arr.slice(3).join('/'),
    });
  }

  // toString(): sessions/[:sessionId]/mount/
  get isRootLevel(): boolean {
    return isEmpty(this.segments);
  }

  // toString(): sessions/[:sessionId]/mount/[...segments]
  get isSegmentLevel(): boolean {
    return !isEmpty(this.segments);
  }

  toString(): string {
    if (this.isRootLevel) {
      return joinPath('sessions', this.sessionId!, 'mount');
    }
    if (this.isSegmentLevel) {
      return joinPath('sessions', this.sessionId!, 'mount', ...this.segments);
    }
    throw new Error('Invalid path to string');
  }

  toSegmentsString(): string {
    if (this.isRootLevel) {
      return '/';
    }
    if (this.isSegmentLevel) {
      return this.segments.join('/');
    }
    throw new Error('Invalid path to string');
  }

  get name(): string {
    if (this.isRootLevel) {
      return '/';
    }
    if (this.isSegmentLevel) {
      return this.segments.at(-1)!;
    }
    throw new Error('Invalid path no name');
  }

  get parent(): EntityPath {
    if (this.isRootLevel) {
      throw new Error('Root level path has no parent');
    }
    const slice = this.segments.slice(0, -1);
    return new EntityPath(this.sessionId, slice);
  }

  renameTo(newName: string): EntityPath {
    if (this.isRootLevel) {
      throw new Error('Cannot rename root level path');
    }
    if (!newName) {
      throw new Error('New name cannot be empty');
    }
    if (newName.includes('/')) {
      throw new Error('New name cannot contain slashes');
    }
    return EntityPath.fromString(joinPath(this.parent.toString(), newName));
  }

  moveTo(newParent: EntityPath): EntityPath {
    if (this.isRootLevel) {
      throw new Error('Cannot move root level path');
    }
    return EntityPath.fromString(joinPath(newParent.toString(), this.name));
  }

  isDescendantOf(ancestor: EntityPath): boolean {
    if (this.toString() === ancestor.toString()) {
      return false;
    }
    return this.toString().startsWith(ancestor.toString() + '/');
  }

  isAncestorOf(descendant: EntityPath): boolean {
    return descendant.isDescendantOf(this);
  }

  get depth(): number {
    if (this.isRootLevel) {
      return 0;
    }
    if (this.isSegmentLevel) {
      return this.segments.length;
    }
    throw new Error('Invalid path no depth');
  }

  equals(other: EntityPath): boolean {
    return this.toString() === other.toString();
  }

  toRoute(): string {
    if (this.isRootLevel) {
      return joinPath('/sessions', this.sessionId!, 'mount');
    }
    if (this.isSegmentLevel) {
      return joinPath('/sessions', this.sessionId!, 'mount', ...this.segments);
    }
    throw new Error('Invalid path to route');
  }
}
