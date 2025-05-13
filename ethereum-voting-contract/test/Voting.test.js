const Voting = artifacts.require('Voting');

contract('Voting', (accounts) => {
  let votingInstance;

  before(async () => {
    votingInstance = await Voting.deployed();
  });

  it('should initialize the candidates correctly', async () => {
    const candidates = await votingInstance.getCandidates();
    assert.equal(candidates.length, 3, 'Incorrect number of candidates initialized');
    assert.equal(candidates[0], 'Alice', 'First candidate should be Alice');
    assert.equal(candidates[1], 'Bob', 'Second candidate should be Bob');
    assert.equal(candidates[2], 'Charlie', 'Third candidate should be Charlie');
  });

  it('should allow a voter to cast a vote', async () => {
    await votingInstance.vote('Alice', { from: accounts[0] });
    const voteCount = await votingInstance.getVotes('Alice');
    assert.equal(voteCount.toNumber(), 1, 'Vote count for Alice should be 1');
  });

  it('should not allow a voter to vote twice', async () => {
    try {
      await votingInstance.vote('Alice', { from: accounts[0] });
      assert.fail('The same account should not be able to vote twice');
    } catch (error) {
      assert(error.message.includes('You have already voted'), 'Expected voting error not received');
    }
  });

  it('should not allow a vote for an invalid candidate', async () => {
    try {
      await votingInstance.vote('NotACandidate', { from: accounts[1] });
      assert.fail('Should not allow voting for an invalid candidate');
    } catch (error) {
      assert(error.message.includes('Invalid candidate'), 'Expected invalid candidate error not received');
    }
  });
});