import {BodyBuilder} from '../src/bodybuilder'

test('Body test: Seconds', () => {
  const mockedCommit = jest.fn()
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T01:00:02Z'),
        sha: 'sha1'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T01:00:34Z'),
        sha: 'sha2'
      }
    })
  const builder = new BodyBuilder([
    new mockedCommit(),
    new mockedCommit()
  ])

  expect(builder.build().split('\n')[0])
    .toEqual('Elapsed time: 32 seconds')
})

test('Body test: Minutes', () => {
  const mockedCommit = jest.fn()
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T01:01:02Z'),
        sha: 'sha1'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T01:04:24Z'),
        sha: 'sha2'
      }
    })
  const builder = new BodyBuilder([
    new mockedCommit(),
    new mockedCommit()
  ])

  expect(builder.build().split('\n')[0])
    .toEqual('Elapsed time: 3 minutes 22 seconds')
})

test('Body test: Hours', () => {
  const mockedCommit = jest.fn()
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T01:00:02Z'),
        sha: 'sha1'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T02:02:24Z'),
        sha: 'sha2'
      }
    })
  const builder = new BodyBuilder([
    new mockedCommit(),
    new mockedCommit()
  ])

  expect(builder.build().split('\n')[0])
    .toEqual('Elapsed time: 1 hours 2 minutes')
})

test('Body test: 1', () => {
  const mockedCommit = jest.fn()
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T10:00:00Z'),
        sha: 'sha1'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T11:00:00Z'),
        sha: 'sha2'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T12:00:00Z'),
        sha: 'sha3'
      }
    })
  const builder = new BodyBuilder([
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit()
  ])

  const body = builder.build()
  expect(body.split('\n')[0])
    .toEqual('Elapsed time: 2 hours')
  expect(body.match(/\|/g) || [])
    .toHaveLength(1)
})

test('Body test: 2', () => {
  const mockedCommit = jest.fn()
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T00:00:00Z'),
        sha: 'sha1'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T07:00:00Z'),
        sha: 'sha2'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T11:00:00Z'),
        sha: 'sha3'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T18:00:00Z'),
        sha: 'sha4'
      }
    })
  const builder = new BodyBuilder([
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit()
  ])

  const body = builder.build()
  expect(body.split('\n')[0])
    .toEqual('Elapsed time: 4 hours')
  expect(body.match(/\|/g) || [])
    .toHaveLength(3)
})

test('Body test: 3', () => {
  const mockedCommit = jest.fn()
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T00:00:00Z'),
        sha: 'sha1'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T01:00:00Z'),
        sha: 'sha2'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T02:00:00Z'),
        sha: 'sha3'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T10:00:00Z'),
        sha: 'sha4'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T11:00:00Z'),
        sha: 'sha5'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T12:00:00Z'),
        sha: 'sha6'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T20:00:00Z'),
        sha: 'sha7'
      }
    })
    .mockImplementationOnce(() => {
      return {
        createdAt: new Date('2020-01-01T23:00:00Z'),
        sha: 'sha8'
      }
    })
  const builder = new BodyBuilder([
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit(),
    new mockedCommit()
  ])

  const body = builder.build()
  expect(body.split('\n')[0])
    .toEqual('Elapsed time: 7 hours')
  expect(body.match(/\|/g) || [])
    .toHaveLength(5)
})
